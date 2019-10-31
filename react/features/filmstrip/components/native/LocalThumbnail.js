// @flow

import React, { Component } from 'react';
import { View } from 'react-native';

import { getLocalParticipant } from '../../../base/participants';
import { connect } from '../../../base/redux';

import styles from './styles';
import Thumbnail from './Thumbnail';

type Props = {

    /**
     * The local participant.
     */
    _localParticipant: Object,
    setDisableLocal: Function
};

type State = {
    participant: Object,
}

/**
 * Component to render a local thumbnail that can be separated from the
 * remote thumbnails later.
 */
class LocalThumbnail extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {
            participant: props._localParticipant
        }
        this.setParticipant = this.setParticipant.bind(this);
    }

    setParticipant(participant) {
        this.setState({
            participant
        });
    }
    /**
     * Implements React Component's render.
     *
     * @inheritdoc
     */
    render() {
        const { _localParticipant, setDisableLocal } = this.props;
        const { participant } = this.state;

        return (
            <View style = { null }>
                <Thumbnail
                    setDisableLocal = { setDisableLocal }
                    setParticipant = { this.setParticipant }
                    participant = { participant } />
            </View>
        );
    }
}

/**
 * Maps (parts of) the redux state to the associated {@code LocalThumbnail}'s
 * props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     _localParticipant: Participant
 * }}
 */
function _mapStateToProps(state) {
    return {
        /**
         * The local participant.
         *
         * @private
         * @type {Participant}
         */
        _localParticipant: getLocalParticipant(state)
    };
}

export default connect(_mapStateToProps)(LocalThumbnail);
