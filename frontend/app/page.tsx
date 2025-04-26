"use client";

import { signIn, useSession } from 'next-auth/react';
import BunkerHome from './components/BunkerHome';

import GoogleIcon from '@/public/images/google.png';
import Image from 'next/image';
import Loader from './components/Loader';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return(
    <div className='flex flex-col justify-center items-center w-screen h-screen'>
        <Loader/>
        <div className="text-xl mt-10">Getting things ready ...</div>
    </div>
  )

  return session ? (
    <div>
      <BunkerHome/>
    </div>
  ) : (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white flex items-center justify-center px-6">
      <div className="text-center max-w-xl space-y-6">
        <h1 className="text-center text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
        🗂️ Bunker
        </h1>
        <p className="text-lg text-gray-300 font-sans">
        Simple on the surface. Powerful underneath. A private, secure drive built to make storing and managing your files a beautiful, stress-free experience.
        </p>
        <button
          onClick={() => signIn('google')}
          className="inline-flex gap-4 cursor-pointer items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          <Image
            src={GoogleIcon}
            alt='google icon'
            className='w-6'
          />
          Sign in with Google
        </button>
      </div>
    </main>
  );
}

