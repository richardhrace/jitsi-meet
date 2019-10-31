// @flow

import React, { Component, Fragment } from 'react';
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
    participantId: string,
    isNetworkFailure: boolean
}

type State = {
    name: string,
}

/**
 * Renders a label with the display name of the on-stage participant.
 */
class DisplayNameLabel extends Component<Props, State> {

    constructor(props) {
        super(props);
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
            <Fragment>
                { this.props.isNetworkFailure && 
                    <View style = { styles.displayNameBackdrop }>
                        <Text style = { styles.displayNameText }>
                            服务器出现问题，请稍后重试 。
                        </Text>
                    </View>
                }
            </Fragment>
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
    const { error: configError } = state['features/base/config'];
    const { error: connectionError } = state['features/base/connection'];
    const { fatalError } = state['features/overlay'];

    // Currently we only render the display name if it's not the local
    // participant and there is no video rendered for
    // them.
    const _render = Boolean(participantId)
        && localParticipant.id !== participantId
        && !shouldRenderParticipantVideo(state, participantId);

    return {
        // isNetworkFailure:
        //     fatalError === configError || fatalError === connectionError,
        isNetworkFailure: false,
        _participants: state['features/base/participants'],
        _settings: state['features/base/settings'],
        _participantName:
            getParticipantDisplayName(state, participantId),
        _render
    };
}

export default connect(_mapStateToProps)(DisplayNameLabel);
