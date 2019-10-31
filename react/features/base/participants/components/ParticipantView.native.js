// @flow

import React, { Component, Fragment } from 'react';
import { NativeModules, Text, View } from 'react-native';

import { Avatar } from '../../avatar';
import { translate } from '../../i18n';
import { JitsiParticipantConnectionStatus } from '../../lib-jitsi-meet';
import {
    MEDIA_TYPE,
    VideoTrack
} from '../../media';
import { Container, TintedView } from '../../react';
import { appNavigate } from '../../../app';
import { connect } from '../../redux';
import { StyleType } from '../../styles';
import { TestHint } from '../../testing/components';
import { getTrackByMediaTypeAndParticipant } from '../../tracks';

import { shouldRenderParticipantVideo } from '../functions';
import { createToolbarEvent, sendAnalytics } from '../../../analytics';
import { disconnect } from '../../../base/connection';
import styles from './styles';

/**
 * The type of the React {@link Component} props of {@link ParticipantView}.
 */
type Props = {

    /**
     * The connection status of the participant. Her video will only be rendered
     * if the connection status is 'active'; otherwise, the avatar will be
     * rendered. If undefined, 'active' is presumed.
     *
     * @private
     */
    _connectionStatus: string,

    /**
     * The name of the participant which this component represents.
     *
     * @private
     */
    _participantName: string,

    _participants: Array<any>,

    /**
     * True if the video should be rendered, false otherwise.
     */
    _renderVideo: boolean,

    /**
     * The video Track of the participant with {@link #participantId}.
     */
    _videoTrack: Object,

    /**
     * The avatar size.
     */
    avatarSize: number,

    avatarUrl: String,

    /**
     * Whether video should be disabled for his view.
     */
    disableVideo: ?boolean,

    /**
     * Callback to invoke when the {@code ParticipantView} is clicked/pressed.
     */
    onPress: Function,

    /**
     * The ID of the participant (to be) depicted by {@link ParticipantView}.
     *
     * @public
     */
    participantId: string,

    /**
     * The style, if any, to apply to {@link ParticipantView} in addition to its
     * default style.
     */
    style: Object,

    /**
     * The function to translate human-readable text.
     */
    t: Function,

    /**
     * If true, a tinting will be applied to the view, regardless of video or
     * avatar is rendered.
     */
    tintEnabled: boolean,

    /**
     * The style of the tinting when applied.
     */
    tintStyle: StyleType,

    /**
     * The test hint id which can be used to locate the {@code ParticipantView}
     * on the jitsi-meet-torture side. If not provided, the
     * {@code participantId} with the following format will be used:
     * {@code `org.jitsi.meet.Participant#${participantId}`}
     */
    testHintId: ?string,

    /**
     * Indicates if the connectivity info label should be shown, if appropriate.
     * It will be shown in case the connection is interrupted.
     */
    useConnectivityInfoLabel: boolean,

    /**
     * The z-order of the {@link Video} of {@link ParticipantView} in the
     * stacking space of all {@code Video}s. For more details, refer to the
     * {@code zOrder} property of the {@code Video} class for React Native.
     */
    zOrder: number,

    /**
     * Indicates whether zooming (pinch to zoom and/or drag) is enabled.
     */
    zoomEnabled: boolean,
    dispatch: Function,
    isLarge: boolean,
};

type State = {
    timer: any,
    counter: number,
    meetingTime: number,
    meetingTimeStr: string,
    startCall: boolean
}

/**
 * Implements a React Component which depicts a specific participant's avatar
 * and video.
 *
 * @extends Component
 */
class ParticipantView extends Component<Props, State> {
    _hangup: Function;
    constructor(props) {
        super(props);

        this.state = {
            timer: null,
            counter: 0,
            meetingTime: 0,
            startCall: false
        };

        this._hangup = () => {
            sendAnalytics(createToolbarEvent('hangup'));

            // FIXME: these should be unified.
            if (navigator.product === 'ReactNative') {
                this.props.dispatch(appNavigate(undefined));
            } else {
                this.props.dispatch(disconnect(true));
            }
        };
    }

    componentDidMount( ) {
        let timer = setInterval(this.tick, 1000);
        this.setState({
            timer,
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    tick = () => {
        const count = this.props._participants.length;

        this.setState({
            counter: this.state.counter + 1,
            meetingTime: count >= 2 ? this.state.meetingTime + 1 : 0
        }, () => {
            const hours = Math.floor(this.state.meetingTime / 3600);
            const mins = Math.floor((this.state.meetingTime % 3600) / 60);
            const seconds = this.state.meetingTime - (hours * 3600 + mins * 60);

            this.setState({
                meetingTimeStr: `${hours ? hours > 9 ? hours : '0' + hours + ':' : ''}${mins > 9 ? mins : '0' + mins}:${seconds > 9 ? seconds : '0' + seconds}`
            });
        });

        if (!this.state.startCall) return;
        this._hangup();  
    }


    componentWillReceiveProps(newProps) {
        let startCall = false;

        if (newProps._participants.length !== this.props._participants.length) {
            startCall = true;
        }

        this.setState({
            startCall,
            // meetingTime: !startCall ? 0 : this.state.meetingTime
        });
    }

    /**
     * Renders the connection status label, if appropriate.
     *
     * @param {string} connectionStatus - The status of the participant's
     * connection.
     * @private
     * @returns {ReactElement|null}
     */
    _renderConnectionInfo(connectionStatus) {
        let messageKey;

        switch (connectionStatus) {
        case JitsiParticipantConnectionStatus.INACTIVE:
            messageKey = 'connection.LOW_BANDWIDTH';
            break;
        case JitsiParticipantConnectionStatus.INTERRUPTED:
            messageKey = 'connection.USER_CONNECTION_INTERRUPTED';
            break;
        default:
            return null;
        }

        const {
            avatarSize,
            _participantName: displayName,
            t
        } = this.props;

        // XXX Consider splitting this component into 2: one for the large view
        // and one for the thumbnail. Some of these don't apply to both.
        const containerStyle = {
            ...styles.connectionInfoContainer,
            width: avatarSize * 1.5
        };

        return (
            <View
                pointerEvents = 'box-none'
                style = { containerStyle }>
                <Text style = { styles.connectionInfoText }>
                    { t(messageKey, { displayName }) }
                </Text>
            </View>
        );
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            _connectionStatus: connectionStatus,
            _renderVideo: renderVideo,
            _videoTrack: videoTrack,
            onPress,
            tintStyle,
            avatarUrl,
            _participants,
            _settings,
            isLarge
        } = this.props;

        // If the connection has problems, we will "tint" the video / avatar.
        const connectionProblem
            = connectionStatus !== JitsiParticipantConnectionStatus.ACTIVE;
        const useTint
            = connectionProblem || this.props.tintEnabled;

        const testHintId
            = this.props.testHintId
                ? this.props.testHintId
                : `org.jitsi.meet.Participant#${this.props.participantId}`;

        const participantsCount = _participants.length;
        const { meetingTimeStr } = this.state;
        const { isHost, friendName } = this.props._settings;

        return (
            <Container
                onClick = { renderVideo ? undefined : onPress }
                style = {{
                    ...styles.participantView,
                    ...this.props.style
                }}
                touchFeedback = { false }>

                <TestHint
                    id = { testHintId }
                    onPress = { onPress }
                    value = '' />

                { participantsCount === 1 &&
                    <View style = { isLarge ? styles.avatarContainer : styles.normalAvatarContainer }>
                        <Avatar
                            participantId = { this.props.participantId }
                            avatarUrl = { participantsCount === 1 ? avatarUrl : undefined }
                            size = { this.props.avatarSize } />
                        { isHost && isLarge &&
                            <Text style = { styles.displayRequestText }>
                                {`${friendName}`}{"\n"}
                                {`${(_settings.startAudioOnly ? '正在呼叫中' : '正在邀请视频聊天') + "...".substr(0, this.state.counter % 3 + 1)}`}
                            </Text>
                        }
                    </View>
                }

                { renderVideo && participantsCount > 1
                    && <VideoTrack
                        onPress = { onPress }
                        videoTrack = { videoTrack }
                        waitForVideoStarted = { false }
                        zOrder = { this.props.zOrder }
                        zoomEnabled = { this.props.zoomEnabled } /> }

                { !renderVideo && participantsCount > 1
                    &&
                    <View style = { isLarge ? styles.avatarContainer : styles.normalAvatarContainer }>
                        <Avatar
                            participantId = { this.props.participantId }
                            avatarUrl = { participantsCount === 1 ? avatarUrl : undefined }
                            size = { this.props.avatarSize } />
                        { isLarge &&
                            <Text style = { styles.displayRequestText }>
                                {`${friendName}`}{"\n"}
                                {`${meetingTimeStr}`}
                            </Text>
                        }
                    </View>
                }

                { useTint

                    // If the connection has problems, tint the video / avatar.
                    && <TintedView
                        style = {
                            connectionProblem ? undefined : tintStyle } /> }

                { this.props.useConnectivityInfoLabel
                    && this._renderConnectionInfo(connectionStatus) }
            </Container>
        );
    }
}

/**
 * Maps (parts of) the redux state to the associated {@link ParticipantView}'s
 * props.
 *
 * @param {Object} state - The redux state.
 * @param {Object} ownProps - The React {@code Component} props passed to the
 * associated (instance of) {@code ParticipantView}.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state, ownProps) {
    const { disableVideo, participantId } = ownProps;
    let connectionStatus;
    let participantName;

    return {
        _connectionStatus:
            connectionStatus
                || JitsiParticipantConnectionStatus.ACTIVE,
        _participantName: participantName,
        _settings: state['features/base/settings'],
        _participants: state['features/base/participants'],
        _renderVideo: shouldRenderParticipantVideo(state, participantId) && !disableVideo,
        _videoTrack:
            getTrackByMediaTypeAndParticipant(
                state['features/base/tracks'],
                MEDIA_TYPE.VIDEO,
                participantId)
    };
}

export default translate(connect(_mapStateToProps)(ParticipantView));
