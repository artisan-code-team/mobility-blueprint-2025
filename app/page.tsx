'use client'

import { client } from '@/sanity/lib/client'
import { Hero } from "./components/Hero"
import { useEffect, useState } from "react"

interface Exercise {
  _id: string
  name: string
}

export default function Home() {
  const [exercises, setExercises] = useState<Exercise[]>([])

  useEffect(() => {
    client.fetch<Exercise[]>(`*[_type == "exercise"] { _id, name }`).then(setExercises)
  }, [])

  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ul>
          {exercises.map((exercise) => (
            <li key={exercise._id}>{exercise.name}</li>
          ))}
        </ul>
      </div>
    </>
  )
}
