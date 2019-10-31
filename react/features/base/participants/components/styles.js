// @flow

import { BoxModel, ColorPalette } from '../../styles';

/**
 * The styles of the feature base/participants.
 */
export default {
    /**
     * Container for the avatar in the view.
     */
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 155,
    },

    normalAvatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    displayRequestText: {
        alignSelf: 'center',
        textAlign: 'center',
        justifyContent: "center", 
        alignItems: "center",
        color: ColorPalette.white,
        fontSize: 14,
        marginTop: 25,
    },

    /**
     * Style for the text rendered when there is a connectivity problem.
     */
    connectionInfoText: {
        color: ColorPalette.white,
        fontSize: 12,
        marginVertical: BoxModel.margin,
        marginHorizontal: BoxModel.margin,
        textAlign: 'center'
    },

    /**
     * Style for the container of the text rendered when there is a
     * connectivity problem.
     */
    connectionInfoContainer: {
        alignSelf: 'center',
        backgroundColor: ColorPalette.darkGrey,
        borderRadius: 20,
        marginTop: BoxModel.margin
    },

    /**
     * {@code ParticipantView} style.
     */
    participantView: {
        alignItems: 'stretch',
        flex: 1,
        justifyContent: 'center'
    }
};
