import { FlatList, Image, TouchableOpacity, View } from 'react-native'
import React from 'react'
import useAppwrite from '@/lib/useAppwrite'
import { getUserPosts, signOut } from '@/lib/appwrite'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoCard from '@/components/VideoCard'
import EmptyState from '@/components/EmptyState'
import { useGlobalContext } from '@/context/GlobalProvider'
import { icons } from '@/constants'
import InfoBox from '@/components/InfoBox'
import { router } from 'expo-router'

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext()
  const { data: posts } = useAppwrite(() => getUserPosts(user.$id))

  const logout = async () => {
    await signOut()
    setUser(null)
    setIsLoggedIn(false)

    router.replace('/sign-in')
  }

  return (
    <SafeAreaView className={'bg-primary h-full'}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View
            className={'w-full justify-center items-center mt-6 mb-12 px-4'}
          >
            <TouchableOpacity
              className={'w-full items-end mb-10'}
              onPress={logout}
            >
              <Image
                source={icons.logout}
                resizeMode={'contain'}
                className={'w-6 h-6'}
              />
            </TouchableOpacity>

            <View
              className={
                'w-16 h-16 border border-secondary rounded-lg justify-center items-center'
              }
            >
              <Image
                source={{ uri: user?.avatar }}
                className={'w-[90%] h-[90%] rounded-lg'}
                resizeMode={'cover'}
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles={'mt-5'}
              titleStyles={'text-lg'}
            />

            <View className={'mt-5 flex-row'}>
              <InfoBox
                title={posts?.length.toString() || '0'}
                subtitle={'Posts'}
                containerStyles={'mr-10'}
                titleStyles={'text-xl'}
              />

              <InfoBox
                title={'1.2k'}
                subtitle={'Followers'}
                titleStyles={'text-lg'}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title={'No Videos Found'}
            subtitle={'No videos found for this search query'}
          />
        )}
      />
    </SafeAreaView>
  )
}

export default Profile
