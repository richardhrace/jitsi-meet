import { SETTINGS_UPDATED } from './actionTypes';

/**
 * Create an action for when the settings are updated.
 *
 * @param {Object} settings - The new (partial) settings properties.
 * @returns {{
 *     type: SETTINGS_UPDATED,
 *     settings: {
 *         audioOutputDeviceId: string,
 *         avatarID: string,
 *         avatarURL: string,
 *         mainAvatarURL: string,
 *         cameraDeviceId: string,
 *         displayName: string,
 *         email: string,
 *         localFlipX: boolean,
 *         micDeviceId: string,
 *         serverURL: string,
 *         startAudioOnly: boolean,
 *         startWithAudioMuted: boolean,
 *         startWithVideoMuted: boolean,
 *         friendAvatarURL: string,
 *         isVoiceMode: boolean,
 *         isHost: boolean,
 *         friendName: string,
 *     }
 * }}
 */
export function updateSettings(settings) {
    return {
        type: SETTINGS_UPDATED,
        settings
    };
}
