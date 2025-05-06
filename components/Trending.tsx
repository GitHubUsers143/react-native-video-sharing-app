import {
  FlatList,
  Image,
  ImageBackground,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
  ViewToken,
} from 'react-native'
import * as Animatable from 'react-native-animatable'
import { icons } from '@/constants'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useEffect, useState } from 'react'
import type { CustomAnimation } from 'react-native-animatable'

type TrendingItemProps = {
  activeItem: Post
  item: {
    $id: string
    video: string
    thumbnail: string
  }
}

const videoSources: any = {
  '67b59c5e00016a24627c': require('../assets/videos/italian_pup.mp4'),
  '67b59b9400076e2adc16': require('../assets/videos/motivation_1.mp4'),
  '67b59b3f00115e381172': require('../assets/videos/motivation_2.mp4'),
}

type FullStyle = TextStyle & ViewStyle & ImageStyle

const zoomIn: CustomAnimation<FullStyle> = {
  0: {
    transform: [{ scale: 0.9 }],
  },
  1: {
    transform: [{ scale: 1.1 }],
  },
}

const zoomOut: CustomAnimation<FullStyle> = {
  0: {
    transform: [{ scale: 1 }],
  },
  1: {
    transform: [{ scale: 0.9 }],
  },
}

type Post = {
  $id: string
  video: string
  thumbnail: string
}

type TrendingProps = {
  posts: Post[]
}

const TrendingItem = ({ activeItem, item }: TrendingItemProps) => {
  const [play, setPlay] = useState(false)

  const videoSource = item.video.includes('mp4')
    ? item.video
    : videoSources[item.$id] || videoSources['67b59c5e00016a24627c']
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
    <Animatable.View
      className={'mr-5'}
      animation={activeItem.$id === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <VideoView
          style={{
            width: 200,
            height: 288,
            borderRadius: 35,
            marginTop: 12,
            backgroundColor: 'rgb(255 255 255 / 0.1)',
          }}
          player={player}
          nativeControls={true}
          contentFit={'contain'}
        />
      ) : (
        <TouchableOpacity
          className={'relative justify-center items-center'}
          activeOpacity={0.7}
          onPress={() => {
            setPlay(true)
            player.play()
          }}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
            className={
              'w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40'
            }
            resizeMode={'cover'}
          />
          <Image
            source={icons.play}
            className={'w-12 h-12 absolute'}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  )
}

const Trending = ({ posts }: TrendingProps) => {
  const [activeItem, setActiveItem] = useState(posts[1])

  const viewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[]
  }) => {
    if (viewableItems.length > 0) {
      const post = posts.find((p) => p.$id === viewableItems[0].key)
      if (post) setActiveItem(post)
    }
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170, y: 0 }}
      horizontal
    />
  )
}

export default Trending
