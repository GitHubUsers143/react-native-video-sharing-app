import { Image, Text, TouchableOpacity, View } from 'react-native'
import { icons } from '../constants'
import { useEffect, useState } from 'react'
import { useVideoPlayer, VideoView } from 'expo-video'

const videoSources: any = {
  "Dalmatian's journey through Italy": require('../assets/videos/italian_pup.mp4'),
  'Get inspired to code': require('../assets/videos/motivation_1.mp4'),
  'How AI Shapes Coding Future': require('../assets/videos/motivation_2.mp4'),
}

interface Video {
  title: string
  thumbnail: string
  video: string
  creator: {
    username: string
    avatar: string
  }
}

interface VideoCardProps {
  video: Video
}

const VideoCard: React.FC<VideoCardProps> = ({
  video: {
    title,
    thumbnail,
    video,
    creator: { username, avatar },
  },
}) => {
  const [play, setPlay] = useState(false)

  const videoSource = video.includes('mp4')
    ? video
    : videoSources[title] || videoSources["Dalmatian's journey through Italy"]
  const player = useVideoPlayer(videoSource)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (play) {
      interval = setInterval(() => {
        if (player.currentTime === player.duration) {
          setPlay(false)
          player.pause()
          if (interval) clearInterval(interval)
        }
      }, 500)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [play, player])

  return (
    <View className={'flex-col items-center px-4 mb-14'}>
      <View className={'flex-row gap-3 items-start'}>
        <View className={'justify-center items-center flex-row flex-1'}>
          <View
            className={
              'w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5'
            }
          >
            <Image
              source={{ uri: avatar }}
              className={'w-full h-full rounded-lg'}
              resizeMode={'cover'}
            />
          </View>
          <View className={'justify-center flex-1 ml-3 gap-y-1'}>
            <Text
              className={'text-white font-psemibold text-sm'}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className={'text-xs text-gray-100 font-pregular'}
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <View className={'pt-2'}>
          <Image
            source={icons.menu}
            className={'w-5 h-5'}
            resizeMode={'contain'}
          />
        </View>
      </View>
      {play ? (
        <VideoView
          style={{
            width: '100%',
            height: 340,
            borderRadius: 12,
          }}
          player={player}
          nativeControls={true}
          contentFit={'contain'}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setPlay(true)
            player.play()
          }}
          className={
            'w-full h-60 rounded-xl mt-3 relative justify-center items-center'
          }
        >
          <Image
            source={{ uri: thumbnail }}
            className={'w-full h-full rounded-xl mt-3'}
            resizeMode={'cover'}
          />
          <Image
            source={icons.play}
            className={'w-12 h-12 absolute'}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default VideoCard
