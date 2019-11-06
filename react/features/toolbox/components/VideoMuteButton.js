// @flow
import { NativeModules } from 'react-native';
import {
    ACTION_SHORTCUT_TRIGGERED,
    VIDEO_MUTE,
    createShortcutEvent,
    createToolbarEvent,
    sendAnalytics
} from '../../analytics';
import { setAudioOnly } from '../../base/audio-only';
import { translate } from '../../base/i18n';
import {
    MEDIA_TYPE,
    VIDEO_MUTISM_AUTHORITY,
    setVideoMuted
} from '../../base/media';
import { connect } from '../../base/redux';
import { AbstractVideoMuteButton } from '../../base/toolbox';
import type { AbstractButtonProps } from '../../base/toolbox';
import { isLocalTrackMuted } from '../../base/tracks';
import { updateSettings } from '../../base/settings';
import UIEvents from '../../../../service/UI/UIEvents';

declare var APP: Object;

/**
 * The type of the React {@code Component} props of {@link VideoMuteButton}.
 */
type Props = AbstractButtonProps & {

    /**
     * Whether the current conference is in audio only mode or not.
     */
    _audioOnly: boolean,

    /**
     * Whether video is currently muted or not.
     */
    _videoMuted: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
}

/**
 * Component that renders a toolbar button for toggling video mute.
 *
 * @extends AbstractVideoMuteButton
 */
class VideoMuteButton extends AbstractVideoMuteButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.videomute';
    label = 'toolbar.videomute';
    tooltip = 'toolbar.videomute';

    /**
     * Initializes a new {@code VideoMuteButton} instance.
     *
     * @param {Props} props - The read-only React {@code Component} props with
     * which the new instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onKeyboardShortcut = this._onKeyboardShortcut.bind(this);
        this._onStartAudioOnlyChange = this._onStartAudioOnlyChange.bind(this);
    }

    /**
     * Registers the keyboard shortcut that toggles the video muting.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        typeof APP === 'undefined'
            || APP.keyboardshortcut.registerShortcut(
                'V',
                null,
                this._onKeyboardShortcut,
                'keyboardShortcuts.videoMute');
    }

    componentDidUpdate(oldProps) {
        const newProps = this.props
        if(oldProps._audioToVideoResponse !== newProps._audioToVideoResponse) {
          if (newProps._audioToVideoResponse !== "accepted") return;
          this._setVideoMuted(false);
        }
    }

    /**
     * Unregisters the keyboard shortcut that toggles the video muting.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        typeof APP === 'undefined'
            || APP.keyboardshortcut.unregisterShortcut('V');
    }

    _onStartAudioOnlyChange(startAudioOnly) {
        const { dispatch } = this.props;

        dispatch(updateSettings({
            startAudioOnly
        }));
    }

    /**
     * Indicates if video is currently muted ot nor.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    _isVideoMuted() {
        return this.props._videoMuted;
    }

    _onKeyboardShortcut: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action to
     * toggle the video muting.
     *
     * @private
     * @returns {void}
     */
    _onKeyboardShortcut() {
        sendAnalytics(
            createShortcutEvent(
                VIDEO_MUTE,
                ACTION_SHORTCUT_TRIGGERED,
                { enable: !this._isVideoMuted() }));

        super._handleClick();
    }

    /**
     * Changes the muted state.
     *
     * @override
     * @param {boolean} videoMuted - Whether video should be muted or not.
     * @protected
     * @returns {void}
     */
    _setVideoMuted(videoMuted: boolean) {
        const { AudioMode } = NativeModules;
        const { sendAudioToVideoRequest } = AudioMode;
        const { _audioToVideoResponse } = this.props;

        if (videoMuted === false && _audioToVideoResponse !== "accepted") {
            sendAudioToVideoRequest();
            return;
        }

        sendAnalytics(createToolbarEvent(VIDEO_MUTE, { enable: videoMuted }));
        if (this.props._audioOnly) {
            this.props.dispatch(
                setAudioOnly(false, /* ensureTrack */ true));
        }

        this.props.dispatch(
            setVideoMuted(
                videoMuted,
                VIDEO_MUTISM_AUTHORITY.USER,
                /* ensureTrack */ true));

        // FIXME: The old conference logic still relies on this event being
        // emitted.
        typeof APP === 'undefined'
            || APP.UI.emitEvent(UIEvents.VIDEO_MUTED, videoMuted, true);
        
        if (this.props._settings.startAudioOnly && !videoMuted) {
            this._onStartAudioOnlyChange(videoMuted);
        }
    }
}

/**
 * Maps (parts of) the redux state to the associated props for the
 * {@code VideoMuteButton} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _audioOnly: boolean,
 *     _videoMuted: boolean
 * }}
 */
function _mapStateToProps(state): Object {
    const { enabled: audioOnly } = state['features/base/audio-only'];
    const tracks = state['features/base/tracks'];
    const { AudioMode } = NativeModules;
    const { getAudioToVideoResponse } = AudioMode; 

    const _audioToVideoResponse = getAudioToVideoResponse();

    return {
        _audioOnly: Boolean(audioOnly),
        _videoMuted: isLocalTrackMuted(tracks, MEDIA_TYPE.VIDEO),
        _settings: state['features/base/settings'],
        _audioToVideoResponse,
    };
}

export default translate(connect(_mapStateToProps)(VideoMuteButton));
