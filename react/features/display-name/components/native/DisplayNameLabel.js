// @flow

import React, { Component } from 'react';
import { Text, View } from 'react-native';

import {
    getLocalParticipant,
    getParticipantDisplayName,
    shouldRenderParticipantVideo
} from '../../../base/participants';
import { connect } from '../../../base/redux';

import styles from './styles';

type Props = {

    /**
     * The name of the participant to render.
     */
    _participantName: string,

    /**
     * True of the label needs to be rendered. False otherwise.
     */
    _render: boolean,

    /**
     * The ID of the participant to render the label for.
     */
    participantId: string
}

type State = {
    timer: any,
    counter: number,
    timeStr: string
}

/**
 * Renders a label with the display name of the on-stage participant.
 */
class DisplayNameLabel extends Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            timer: null,
            counter: 0,
            timeStr: ''
        };

    }

    componentDidMount() {
        let timer = setInterval(this.tick, 1000);
        this.setState({timer});
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    tick = () => {
        const participantsCount = this.props._participants.length;
        if (participantsCount < 2 ) return;
        const hours = Math.floor(this.state.counter / 3600);
        const mins = Math.floor((this.state.counter % 3600) / 60);
        const seconds = this.state.counter - (hours * 3600 + mins * 60);
        this.setState({
            counter: this.state.counter + 1,
            timeStr: `${hours ? hours > 9 ? hours : '0' + hours + ':' : ''}${mins > 9 ? mins : '0' + mins}:${seconds > 9 ? seconds : '0' + seconds}`
        });
    }
    /**
     * Implements {@code Component#render}.
     *
     * @inheritdoc
     */
    render() {
        if (!this.props._render) {
            return null;
        }

        return (
            <View style = { styles.displayNameBackdrop }>
                <Text style = { styles.displayNameText }>
                    { this.props._participantName }
                </Text>
                <Text style = { styles.displayNameText }>
                    { `${this.state.timeStr}` }
                </Text>
            </View>
        );
    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @param {Props} ownProps - The own props of the component.
 * @returns {{
 * }}
 */
function _mapStateToProps(state: Object, ownProps: Props) {
    const { participantId } = ownProps;
    const localParticipant = getLocalParticipant(state);

    // Currently we only render the display name if it's not the local
    // participant and there is no video rendered for
    // them.
    const _render = Boolean(participantId)
        && localParticipant.id !== participantId
        && !shouldRenderParticipantVideo(state, participantId);

    return {
        _participants: state['features/base/participants'],
        _participantName:
            getParticipantDisplayName(state, participantId),
        _render
    };
}

export default connect(_mapStateToProps)(DisplayNameLabel);
