interface ThreadOptions {
  thread: string[];
  images?: { index: number; url: string }[];
  accessToken: string;
}

interface TweetResponse {
  data: {
    id: string;
    text: string;
  };
}

/**
 * Posts a thread to Twitter using the v2 API
 */
export async function postThread({ thread, images, accessToken }: ThreadOptions) {
  let previousTweetId: string | null = null;
  const results: TweetResponse[] = [];

  for (const [index, tweet] of thread.entries()) {
    // Prepare tweet text with thread numbering
    const tweetText = `${tweet}\n\n🧵 ${index + 1}/${thread.length}`;

    // Prepare tweet data
    const tweetData: any = {
      text: tweetText,
    };

    // Add reply parameters if this is not the first tweet
    if (previousTweetId) {
      tweetData.reply = {
        in_reply_to_tweet_id: previousTweetId,
      };
    }

    // Add media if present for this tweet
    const tweetImage = images?.find(img => img.index === index);
    if (tweetImage) {
      // Upload media first
      const mediaId = await uploadMedia(tweetImage.url, accessToken);
      if (mediaId) {
        tweetData.media = {
          media_ids: [mediaId],
        };
      }
    }

    // Post the tweet
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to post tweet: ${JSON.stringify(error)}`);
    }

    const result: TweetResponse = await response.json();
    previousTweetId = result.data.id;
    results.push(result);
  }

  return results;
}

/**
 * Uploads media to Twitter and returns the media ID
 */
async function uploadMedia(url: string, accessToken: string): Promise<string | null> {
  try {
    // First, fetch the image data
    const imageResponse = await fetch(url);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Upload to Twitter's media endpoint
    const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
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