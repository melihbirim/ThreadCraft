import { generateOAuth1Header } from './oauth';

interface ThreadOptions {
    thread: string[];
    images?: { index: number; url: string }[];
    accessToken: string;
    accessSecret?: string;
}

interface PostResponse {
    data: {
        id: string;
        text: string;
    };
}

/**
 * Posts a thread to X using the v2 API
 */
export async function postThread({ thread, images, accessToken, accessSecret }: ThreadOptions) {
    let previousPostId: string | null = null;
    const results: PostResponse[] = [];

    for (const [index, post] of thread.entries()) {
        // Prepare post text with thread numbering
        const postText = `${post}\n\n🧵 ${index + 1}/${thread.length}`;

        // Prepare post data
        const postData: any = {
            text: postText,
        };

        // Add reply parameters if this is not the first post
        if (previousPostId) {
            postData.reply = {
                in_reply_to_tweet_id: previousPostId,
            };
        }

        // Add media if present for this post
        const postImage = images?.find(img => img.index === index);
        if (postImage) {
            // Upload media first
            const mediaId = await uploadMedia(postImage.url, accessToken, accessSecret);
            if (mediaId) {
                postData.media = {
                    media_ids: [mediaId],
                };
            }
        }

        // Post to X using appropriate API version
        const response = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to create post: ${JSON.stringify(error)}`);
        }

        const result: PostResponse = await response.json();
        previousPostId = result.data.id;
        results.push(result);
    }

    return results;
}

/**
 * Uploads media to X and returns the media ID
 */
async function uploadMedia(url: string, accessToken: string, accessSecret?: string): Promise<string | null> {
    try {
        // First, fetch the image data
        const imageResponse = await fetch(url);
        const imageBuffer = await imageResponse.arrayBuffer();

        // Upload to X's media endpoint
        const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
            method: 'POST',
            headers: accessSecret ? {
                'Authorization': generateOAuth1Header('POST', 'https://upload.twitter.com/1.1/media/upload.json', {
                    oauth_token: accessToken,
                    oauth_token_secret: accessSecret
                }),
                'Content-Type': 'multipart/form-data',
            } : {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
            },
            body: imageBuffer,
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload media');
        }

        const result = await uploadResponse.json();
        return result.media_id_string;
    } catch (error) {
        console.error('Media upload error:', error);
        return null;
    }
} 