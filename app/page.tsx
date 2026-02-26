'use client'

import { useUsername } from '@/hooks/use-username'
import { client } from '@/lib/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

const timeValues = [10, 20, 30, 40, 50, 60] as const

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <Lobby />
    </Suspense>
  )
}

export const Loading = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4'>
      <h1 className='text-2xl font-bold tracking-tight text-zinc-500'>
        Loading...
      </h1>
    </main>
  )
}

export const Lobby = () => {

  const router = useRouter()
  const { username } = useUsername()
  const [roomTime, setRoomTime] = useState(10)
  const searchParams = useSearchParams()
  const wasDestroyed = searchParams.get('destroyed') === 'true'
  const error = searchParams.get('error')

  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: async (roomTime: number) => {
      const res = await client.room.create.post({
        ttl: roomTime
      })

      if(res.status == 200) {
        router.push(`/room/${res.data?.roomId}`)
      }
    }
  })

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>

        {wasDestroyed && (
          <div className='bg-red-950/50 border border-red-900 p-4 text-center'>
            <p className='text-red-500 text-sm font-bold'>
              ROOM DESTROYED
            </p>
            <p className='text-zinc-500 text-xs mt-1'>
              All messages were permanently deleted.
            </p>
          </div>
        )}

        {error === 'room-not-found' && (
          <div className='bg-red-950/50 border border-red-900 p-4 text-center'>
            <p className='text-red-500 text-sm font-bold'>
              ROOM NOT FOUND
            </p>
            <p className='text-zinc-500 text-xs mt-1'>
              This room may have expired or never existed.
            </p>
          </div>
        )}

        {error === 'room-full' && (
          <div className='bg-red-950/50 border border-red-900 p-4 text-center'>
            <p className='text-red-500 text-sm font-bold'>
              ROOM FULL
            </p>
            <p className='text-zinc-500 text-xs mt-1'>
              This room is at maximum capacity.
            </p>
          </div>
        )}

        <div className='text-center space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight text-green-500'>
            {'>'}private_chat
          </h1>
          <p className='text-zinc-500 text-sm'>
            a private, self-destructing chat room.
          </p>
        </div>

        <div className='border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md'>
          <div className='space-y-5'>
            <div className='space-y-2'>
              <label className='flex items-center text-zinc-500'>
                Your Identity
              </label>

              <div className='flex items-center gap-3'>
                <div className='flex-1 w-2/3 bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono'>
                  {username}
                </div>

                <div className='flex items-center w-1/3 text-zinc-200'>
                  <select 
                    name='time values' 
                    id='time-values' 
                    className='mr-2'
                    onChange={(e) => setRoomTime(Number(e.target.value))}
                    value={roomTime}
                  >
                    {timeValues.map(val => (
                      <option key={val} value={val}>{String(val)}</option>
                    ))}
                  </select>
                  <span>Minutes</span>
                </div>
              </div>
            </div>

            <button
              className='w-full bg-zinc-200 text-black p-3 text-sm font-bold hover:bg-zinc-50 transition-colors mt-2 cursor-pointer disabled:opacity-50'
              onClick={() => createRoom(roomTime)}
              disabled={isPending}
            >
              CREATE SECURE ROOM
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
