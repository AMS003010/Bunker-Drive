import Link from "next/link";
import Loader from "./components/Loader";

export default function NotFound() {
    return (
        <div className='flex flex-col justify-center items-center w-screen h-screen'>
            <Loader/>
            <div className="text-xl mt-10">Looks like you are lost‼️ <Link href="/" className={`text-xl hover:border-b-2`}>Get back home ↗️</Link></div>
        </div>
    )
}