import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { toast } from "react-hot-toast";
import { useSession, signOut } from 'next-auth/react';
import axios from 'axios';
import { CircleHelp, Grip, LogOut, Plus, Search, Settings, SlidersHorizontal, Upload } from 'lucide-react';
import { FileData } from '../types/type';

import GoogleContact from '@/public/images/contacts.png';
import GoogleTips from '@/public/images/tips.png';
import GoogleEvents from '@/public/images/events.png';
import GoogleCalendar from '@/public/images/calendar.png';
import ProfileImage from '@/public/images/profile.png';
import GoogleDrive from '@/public/images/GoogleDrive.png';
import Home1 from '@/public/images/home_1.png';
import Mydrive2 from '@/public/images/mydrive_2.png';
import Computers3 from '@/public/images/computers_3.png';
import Shared4 from '@/public/images/shared_4.png';
import Recent5 from '@/public/images/recent_5.png';
import Starred6 from '@/public/images/starred_6.png';
import Spam7 from '@/public/images/spam_7.png';
import Trash8 from '@/public/images/trash_8.png';
import Storage9 from '@/public/images/storage_9.png';
import ChevronDown from '@/public/images/chevronDown.png';
import EmptyImage from '@/public/images/empty.png';
import FileComponent from './FileComponent';

export default function BunkerHome () {
    const [data,setData] = useState<null | FileData[]>(null);
    const [query, setQuery] = useState<"" | string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: session } = useSession();

    useEffect(() => {
        const backend_jwt = session?.backendJWT;
        const user_id = session?.userId;

        const fetchFiles = async () => {
            try {                
                const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/search`,
                { query: `${query}` },
                {
                    headers: {
                        Authorization: `Bearer ${backend_jwt}`,
                        'x-user-id': user_id,
                    },
                }
                );
                console.log(res.data.results)        
                setData(res.data.results);
            } catch (err) {
                console.error("Error fetching files:", err);
            }
        };
      
        fetchFiles();
    }, [session, query]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const getContentType = (filename: string) => {
        const extension = filename.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'application/pdf';
            case 'png':
                return 'image/png';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            default:
                return '';
        }
    };

    const validateFileType = (file: File) => {
        const validTypes = ['.pdf', '.png', '.docx'];
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return validTypes.includes(extension);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        
        if (!validateFileType(selectedFile)) {
            toast.error("Only PNG, PDF, and DOCX files are supported.");
            setUploadError('Only PDF, PNG, and DOCX files are allowed.');
            return;
        }
        
        uploadFile(selectedFile);
    };

    // Modify the uploadFile function to handle CORS properly
const uploadFile = async (file: File) => {
    const backend_jwt = session?.backendJWT;
    const user_id = session?.userId;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    try {
      // Step 1: Get upload URL
      const contentType = getContentType(file.name);
      const uploadUrlResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/upload-url`,
        {
          filename: file.name,
          contentType: contentType
        },
        {
          headers: {
            Authorization: `Bearer ${backend_jwt}`,
            'x-user-id': user_id,
          }
        }
      );
      
      const { uploadUrl, key } = uploadUrlResponse.data;
      
      // Step 2: Upload file to the URL using fetch instead of axios
      // This avoids CORS preflight issues with S3
      const upload = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': contentType
        }
      });
      
      if (!upload.ok) {
        throw new Error(`Upload failed with status: ${upload.status}`);
      }
      
      // Step 3: Save metadata
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/save-metadata`,
        {
          filename: file.name,
          key: key,
          url: `https://bunker-drive-storage.s3.amazonaws.com/${key}`
        },
        {
          headers: {
            Authorization: `Bearer ${backend_jwt}`,
            'x-user-id': user_id,
          }
        }
      );
      
      // Reset states and close modal
      setIsUploading(false);
      setUploadProgress(100);
      
      // Trigger refresh of files list here based on your app architecture
      
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError('Failed to upload file. Please try again.');
      setIsUploading(false);
    }
  };

    const uploadButton = (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          <Upload size={16} className="mr-2" />
          Upload File
        </button>
    );

    const signOutButton = (
        <button
            onClick={() => signOut()}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
    );
      
    const fileInput = (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.png,.docx"
          style={{ display: 'none' }}
        />
    );
      
    const uploadModal = (
    <>
        {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-zinc-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium text-white mb-4">Uploading File</h3>
            <div className="w-full bg-zinc-700 rounded-full h-2.5 mb-4">
                <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
                ></div>
            </div>
            <p className="text-gray-300 text-sm">{uploadProgress}% Complete</p>
            {uploadError && <p className="text-red-500 text-sm mt-3">{uploadError}</p>}
            </div>
        </div>
        )}
    </>
    );

    return(
        <div className="flex justify-between min-h-screen max-h-max">
            <div className='flex flex-col justify-start gap-3 items-start p-5 text-[#9b9c9c] w-[20rem]'>
                <div className='flex justify-start items-center gap-3 mb-5'>
                    <div>
                        <Image
                            src={GoogleDrive}
                            alt='profile-pic'
                            className='w-10'
                        />
                    </div>
                    <div className='text-lg font-medium'>Drive</div>
                </div>
                {uploadButton}
                {fileInput}
                {uploadModal}
                <div className='flex flex-col justify-start items-start gap-6 w-[100%]'>
                    <div className='flex flex-col justify-start items-start gap-1 w-[100%]'>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Home1}
                                    alt='home'
                                    className='w-3.5'
                                />
                            </div>
                            <div>Home</div>
                        </div>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Mydrive2}
                                    alt='my drive'
                                    className='w-3.5'
                                />
                            </div>
                            <div>MyDrive</div>
                        </div>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Computers3}
                                    alt='computers'
                                    className='w-3.5'
                                />
                            </div>
                            <div>Computers</div>
                        </div>
                    </div>
                    <div className='flex flex-col justify-start items-start gap-1 w-[100%]'>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Shared4}
                                    alt='shared'
                                    className='w-3.5'
                                />
                            </div>
                            <div>Shared with me</div>
                        </div>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Recent5}
                                    alt='recent'
                                    className='w-3.5'
                                />
                            </div>
                            <div>Recent</div>
                        </div>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Starred6}
                                    alt='starred'
                                    className='w-3.5'
                                />
                            </div>
                            <div>Starred</div>
                        </div>
                    </div>
                    <div className='flex flex-col justify-start items-start gap-1 w-[100%]'>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Spam7}
                                    alt='spam'
                                    className='w-3.5'
                                />
                            </div>
                            <div>Spam</div>
                        </div>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Trash8}
                                    alt='trash'
                                    className='w-3.5'
                                />
                            </div>
                            <div>Trash</div>
                        </div>
                        <div className='flex justify-start items-center gap-3 w-[100%]  hover:bg-[#00416b] hover:ring-1 hover:ring-[#0a324d] rounded-3xl p-1.5 px-5 cursor-pointer'>
                            <div>
                                <Image
                                    src={Storage9}
                                    alt='storage'
                                    className='w-3.5'
                                />
                            </div>
                            <div>{`Storage (94% full)`}</div>
                        </div>
                        <div className='flex flex-col justify-start items-start gap-2 w-[100%] pl-3 mt-2'>
                            <div className='h-1 w-[70%] bg-[#f9aea5] rounded-r-2xl'></div>
                            <div className='font-mono text-xs'>14.12GB 0f 150GB used</div>
                            <div className='text-sm p-2 px-4 ring-1 ring-[#575858] rounded-3xl font-medium mt-3'>Get more storage</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-[100%]'>
                <div className='flex justify-between items-center p-4'>
                    <div className='flex justify- items-center p-1.5 px-6 rounded-3xl bg-[#222626]'>
                        <Search size={20}/>
                        <input
                            type='text'
                            value={query}
                            onChange={handleInputChange}
                            placeholder='Search in Drive'
                            className='focus:outline-0 p-1 px-4 w-[25rem]'
                        />
                        <SlidersHorizontal size={35} className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer'/>
                    </div>
                    <div className='flex justify-center items-center w-max gap-2'>
                        {signOutButton}
                        <CircleHelp className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer' size={40}/>
                        <Settings className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer' size={40}/>
                        <Grip className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer' size={40}/>
                    </div>
                </div>
                <div className='bg-[#141414] rounded-2xl w-[100%] h-[88%] p-6'>
                    <div className='text-3xl mb-4'>My Drive</div>
                    <div className='flex justify-start gap-2 '>
                        <div className='flex justify-center items-center gap-6 rounded-lg ring-1 ring-[#505050] p-2 px-5'>
                            <div className='text-xs'>Type</div>
                            <div>
                                <Image
                                    src={ChevronDown}
                                    alt='chevron'
                                    className='w-2'
                                />
                            </div>
                        </div>
                        <div className='flex justify-center items-center gap-6 rounded-lg ring-1 ring-[#505050] p-2 px-5'>
                            <div className='text-xs'>People</div>
                            <div>
                                <Image
                                    src={ChevronDown}
                                    alt='chevron'
                                    className='w-2'
                                />
                            </div>
                        </div>
                        <div className='flex justify-center items-center gap-6 rounded-lg ring-1 ring-[#505050] p-2 px-5'>
                            <div className='text-xs'>Modified</div>
                            <div>
                                <Image
                                    src={ChevronDown}
                                    alt='chevron'
                                    className='w-2'
                                />
                            </div>
                        </div>
                    </div>
                    {data!=null ? (
                        data.length==0 ? (
                            <div className='flex flex-col justify-center items-center mt-16'>
                                <div>
                                    <Image
                                        src={EmptyImage}
                                        alt='empty image'
                                        className='w-50'
                                    />
                                </div>
                                <div className='font-mono'>All Empty here !! Upload files</div>
                            </div>
                        ) : (
                            <div className='grid grid-cols-4 gap-8 mt-6'>
                                {data.map((file) => (
                                    <FileComponent file={file} key={file._id}/>
                                ))}
                            </div>       
                        )
                    ) : (
                        <div>Loading ....</div>
                    )}
                </div>
            </div>
            <div className='flex flex-col justify-start items-center gap-5 p-2 mt-4'>
                <div>
                    <Image
                        src={ProfileImage}
                        alt='profile-pic'
                        className='w-10'
                    />
                </div>
                <div className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer mt-4'>
                    <Image
                        src={GoogleCalendar}
                        alt='google calendar'
                        className='w-6'
                    />
                </div>
                <div className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer'>
                    <Image
                        src={GoogleEvents}
                        alt='google events'
                        className='w-6'
                    />
                </div>
                <div className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer'>
                    <Image
                        src={GoogleTips}
                        alt='google tips'
                        className='w-6'
                    />
                </div>
                <div className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer'>
                    <Image
                        src={GoogleContact}
                        alt='google contacts'
                        className='w-6'
                    />
                </div>
                <hr className='w-6 text-[#292828]'/>
                <div>
                    <Plus size={40} className='p-2 rounded-full hover:bg-[#2f3233] cursor-pointer'/>
                </div>
            </div>
        </div>
    )
}