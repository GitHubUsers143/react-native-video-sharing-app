import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

const useAppwrite = <T>(fn: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fn()
      setData(response)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
        throw new Error(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const refetch = () => fetchData()

  return { data, isLoading, refetch }
}

export default useAppwrite
