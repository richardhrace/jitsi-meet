/*
 * Copyright @ 2019-present 8x8, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "JitsiMeetUserInfo+Private.h"

@implementation JitsiMeetUserInfo

- (instancetype)initWithDisplayName:(NSString *)displayName
                           andEmail:(NSString *)email
                           andFriendAvatarURL:(NSString *)friendAvatarURL
                            andFriendName:(NSString *)friendName
                            andIsHost:(BOOL)isHost
                            andIsVoiceMode:(BOOL)isVoiceMode
                          andAvatar:(NSURL *_Nullable) avatar {
    self = [super init];
    if (self) {
        self.displayName = displayName;
        self.friendAvatarURL = friendAvatarURL;
        self.friendName = friendName;
        self.isHost = isHost;
        self.isVoiceMode = isVoiceMode;
        self.email = email;
        self.avatar = avatar;
    }

    return self;
}

- (NSDictionary *)asDict {
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];

    if (self.displayName != nil) {
        dict[@"displayName"] = self.displayName;
    }

    if (self.friendAvatarURL != nil) {
        dict[@"friendAvatarURL"] = self.friendAvatarURL;
    }

    if (self.friendName != nil) {
        dict[@"friendName"] = self.friendName;
    }

    if (self.email != nil) {
        dict[@"email"] = self.email;
    }

    dict[@"isHost"] = self.isHost;
    dict[@"isVoiceMode"] = self.isVoiceMode;

    if (self.avatar != nil) {
        NSString *avatarURL = [self.avatar absoluteString];
        if (avatarURL != nil) {
            dict[@"avatarURL"] = avatarURL;
        }
    }

    return dict;
}

@end
