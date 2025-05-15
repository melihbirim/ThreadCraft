import { generateOAuth1Header } from './oauth';

interface ThreadOptions {
    thread: string[];
    images?: { index: number; url: string }[];
    accessToken: string;
}

interface PostResponse {
    data: {
        id: string;
        text: string;
    };
}

interface TwitterV2Response {
    data: {
        id: string;
        text: string;
    };
    errors?: Array<{
        message: string;
        code: number;
        title: string;
        type: string;
    }>;
}

// Rate limit handling constants
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds
const TWEET_INTERVAL_DELAY = 5000; // 5 seconds between tweets
const RATE_LIMIT_BACKOFF_MULTIPLIER = 2;

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Handle rate limiting with exponential backoff
 */
async function handleRateLimit(retryCount: number): Promise<number> {
    const delay = INITIAL_RETRY_DELAY * Math.pow(RATE_LIMIT_BACKOFF_MULTIPLIER, retryCount);
    console.log(`Rate limit hit. Waiting ${delay/1000} seconds before retry ${retryCount + 1}/${MAX_RETRIES}...`);
    await sleep(delay);
    return delay;
}

/**
 * Posts a thread to X using the v2 API
 */
export async function postThread({ thread, images, accessToken }: ThreadOptions) {
    let previousPostId: string | null = null;
    let retryCount = 0;
    const results: PostResponse[] = [];
    const errors: { index: number; error: string }[] = [];

    console.log('Starting thread post with:', {
        tweetCount: thread.length,
        hasImages: !!images?.length,
        hasAccessToken: !!accessToken
    });

    for (const [index, post] of thread.entries()) {
        let success = false;
        retryCount = 0; // Reset retry count for each new tweet

        // Add delay between tweets to avoid rate limits
        if (index > 0) {
            console.log(`Waiting ${TWEET_INTERVAL_DELAY/1000} seconds before posting next tweet...`);
            await sleep(TWEET_INTERVAL_DELAY);
        }

        while (!success && retryCount < MAX_RETRIES) {
            try {
                console.log(`Posting tweet ${index + 1}/${thread.length}...`);
                
                // Add thread numbering and #threadcraftx hashtag only to the last tweet
                const isLastTweet = index === thread.length - 1;
                const postText = isLastTweet
                    ? `${post}\n\n🧵 ${index + 1}/${thread.length} #threadcraftx`
                    : `${post}\n\n🧵 ${index + 1}/${thread.length}`;

                // Prepare post data
                const postData: any = {
                    text: postText,
                };

                // Add reply parameters if this is not the first post
                if (previousPostId) {
                    postData.reply = {
                        in_reply_to_tweet_id: previousPostId
                    };
                }

                // Add media if present for this post
                const postImage = images?.find(img => img.index === index);
                if (postImage) {
                    // Upload media first
                    const mediaId = await uploadMedia(postImage.url, accessToken);
                    if (mediaId) {
                        postData.media = {
                            media_ids: [mediaId]
                        };
                    }
                }

                console.log('Sending request with data:', {
                    tweetIndex: index,
                    hasReplyTo: !!previousPostId,
                    hasMedia: !!postData.media,
                    textLength: postText.length
                });

                // Post to X using v2 API
                const response = await fetch('https://api.twitter.com/2/tweets', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postData)
                });

                const responseData = await response.json() as TwitterV2Response;
                console.log('Response from X API:', {
                    status: response.status,
                    ok: response.ok,
                    data: responseData
                });

                if (!response.ok) {
                    // Handle rate limiting
                    if (response.status === 429) {
                        // Check if it's a daily tweet limit
                        const dailyLimit = response.headers.get('x-user-limit-24hour-limit');
                        const dailyRemaining = response.headers.get('x-user-limit-24hour-remaining');
                        const dailyReset = response.headers.get('x-user-limit-24hour-reset');
                        
                        if (dailyLimit && dailyRemaining === '0') {
                            const resetTime = new Date(parseInt(dailyReset!) * 1000);
                            const resetTimeStr = resetTime.toLocaleString();
                            throw new Error(`Daily tweet limit (${dailyLimit} tweets) reached. Limit will reset at ${resetTimeStr}`);
                        }

                        // Log rate limit headers
                        console.log('Rate limit headers:', {
                            'x-rate-limit-limit': response.headers.get('x-rate-limit-limit'),
                            'x-rate-limit-remaining': response.headers.get('x-rate-limit-remaining'),
                            'x-rate-limit-reset': response.headers.get('x-rate-limit-reset'),
                            'x-user-limit-24hour-limit': dailyLimit,
                            'x-user-limit-24hour-remaining': dailyRemaining,
                            'x-user-limit-24hour-reset': dailyReset
                        });

                        // Log full error response
                        console.log('Twitter API Error Response:', {
                            status: response.status,
                            statusText: response.statusText,
                            headers: Object.fromEntries(response.headers.entries()),
                            data: responseData
                        });

                        if (retryCount < MAX_RETRIES) {
                            const delay = await handleRateLimit(retryCount);
                            console.log(`Rate limited. Retrying tweet ${index + 1} in ${delay}ms...`);
                            retryCount++;
                            continue;
                        }
                        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
                    }

                    // Handle other errors
                    let errorMessage = 'Failed to create post';
                    if (responseData.errors?.[0]?.message) {
                        errorMessage = responseData.errors[0].message;
                    }
                    throw new Error(errorMessage);
                }

                previousPostId = responseData.data.id;
                results.push({ data: { id: responseData.data.id, text: responseData.data.text } });
                success = true;
                console.log(`Successfully posted tweet ${index + 1}/${thread.length} with ID: ${responseData.data.id}`);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Error posting tweet ${index + 1}:`, errorMessage);

                if (retryCount >= MAX_RETRIES - 1) {
                    errors.push({ index, error: errorMessage });
                    // If this is the first tweet and it fails, we can't continue
                    if (index === 0) {
                        throw new Error(`Failed to post the first tweet: ${errorMessage}`);
                    }
                    // For other tweets, log the error and continue with the thread
                    break;
                }
                retryCount++;
                await handleRateLimit(retryCount);
            }
        }
    }

    // If we have any results but also errors, throw a detailed error
    if (results.length > 0 && errors.length > 0) {
        throw new Error(`Thread partially posted (${results.length}/${thread.length} tweets). Some tweets failed: ${errors.map(e => `Tweet ${e.index + 1}: ${e.error}`).join(', ')}`);
    }

    return results;
}

/**
 * Uploads media to X and returns the media ID
 */
async function uploadMedia(url: string, accessToken: string): Promise<string | null> {
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
        try {
            // First, fetch the image data
            const imageResponse = await fetch(url);
            const imageBuffer = await imageResponse.arrayBuffer();

            // Create form data with base64 encoded image
            const base64Image = Buffer.from(imageBuffer).toString('base64');

            // Initialize media upload
            const initResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    command: 'INIT',
                    total_bytes: imageBuffer.byteLength.toString(),
                    media_type: 'image/jpeg', // Adjust based on actual image type
                }).toString(),
            });

            const initData = await initResponse.json();
            if (!initResponse.ok) {
                throw new Error(`Failed to initialize media upload: ${JSON.stringify(initData)}`);
            }

            // Upload media chunks
            const appendResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    command: 'APPEND',
                    media_id: initData.media_id_string,
                    media_data: base64Image,
                    segment_index: '0',
                }).toString(),
            });

            if (!appendResponse.ok) {
                throw new Error('Failed to upload media chunk');
            }

            // Finalize media upload
            const finalizeResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    command: 'FINALIZE',
                    media_id: initData.media_id_string,
                }).toString(),
            });

            const finalizeData = await finalizeResponse.json();
            if (!finalizeResponse.ok) {
                throw new Error(`Failed to finalize media upload: ${JSON.stringify(finalizeData)}`);
            }

            return finalizeData.media_id_string;

        } catch (error) {
            if (retryCount >= MAX_RETRIES - 1) {
                console.error('Media upload error:', error);
                return null;
            }
            retryCount++;
            await handleRateLimit(retryCount);
        }
    }
    return null;
} 