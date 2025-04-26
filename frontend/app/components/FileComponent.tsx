import { FileData } from "../types/type"
import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { EllipsisVertical, Download, Edit, Trash2, ExternalLink } from 'lucide-react';

import WordIcon from '@/public/images/doc.png';
import PDFIcon from '@/public/images/pdf.png';
import ImgIcon from '@/public/images/img.png';


interface FileComponentProps {
    file: FileData;
    key: string;
}

export default function FileComponent({file}: FileComponentProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newFilename, setNewFilename] = useState(file.filename);
    const [renameError, setRenameError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDownload = async () => {
        const backend_jwt = session?.backendJWT;
        const user_id = session?.userId;
    
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/download/${file._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${backend_jwt}`,
                        'x-user-id': user_id,
                    },
                }
            );
    
            const presignedUrl = res.data.downloadUrl;
    
            const response = await fetch(presignedUrl);
            const blob = await response.blob();
    
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = file.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
    
            window.URL.revokeObjectURL(blobUrl); // cleanup
        } catch (err) {
            console.error("Download failed:", err);
        }
    };
    
    const handleRename = async () => {
        const backend_jwt = session?.backendJWT;
        const user_id = session?.userId;
      
        if (!newFilename || newFilename.trim() === '') {
            setRenameError('Filename cannot be empty');
            return;
        }
      
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/rename/${file._id}`,
                { newFilename },
                {
                    headers: {
                        Authorization: `Bearer ${backend_jwt}`,
                        'x-user-id': user_id,
                    },
                }
            );

            setIsRenaming(false);
            setShowDropdown(false);
            window.location.reload();
        } catch (err) {
            console.error("Rename failed:", err);
            setRenameError('Failed to rename file');
        }
    };

    const handleDelete = async () => {
        const backend_jwt = session?.backendJWT;
        const user_id = session?.userId;
      
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/delete/${file._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${backend_jwt}`,
                        'x-user-id': user_id,
                    },
                }
            );
          
            setIsDeleting(false);
            setShowDropdown(false);
            window.location.reload();
        } catch (err) {
            console.error("Delete failed:", err);
            setDeleteError('Failed to delete file');
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <div className="w-64 h-60 rounded-xl p-3 bg-zinc-900">
        <div className="flex justify-between items-center px-1.5 p-1">
            <div className="flex justify-start items-center gap-3">
            <div>
                <Image
                    src={file.filename.split('.').pop()?.toLowerCase()=='png' ? ImgIcon : file.filename.split('.').pop()?.toLowerCase()=='docx' ? WordIcon : PDFIcon }
                    alt="file icon"
                    className="w-5"
                />
            </div>
            <div className="text-sm text-gray-200">{file.filename}</div>
            </div>
            <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
            >
                <EllipsisVertical size={17} className="text-gray-300" />
            </button>
            
            {showDropdown && (
                <div className="absolute right-0 z-10 mt-1 w-48 rounded-md bg-zinc-800 shadow-lg py-1">
                <div className="py-1">
                    <a
                        href={`${file.url}`}
                        target="_blank"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-zinc-700 transition-colors">
                        <ExternalLink size={16} className="mr-3" />
                        Open
                    </a>
                    <button
                        onClick={handleDownload}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-zinc-700 transition-colors"
                    >
                        <Download size={16} className="mr-3 text-green-400" />
                        Download
                    </button>
                    <button
                        onClick={() => {
                            setIsRenaming(true);
                            setNewFilename(file.filename);
                            setRenameError('');
                            setShowDropdown(false);
                        }} 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-zinc-700 transition-colors"
                    >
                        <Edit size={16} className="mr-3 text-yellow-400" />
                        Rename
                    </button>
                    <button
                        onClick={() => {
                            setIsDeleting(true);
                            setDeleteError('');
                            setShowDropdown(false);
                        }} 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-zinc-700 transition-colors"
                    >
                        <Trash2 size={16} className="mr-3 text-red-400" />
                        Delete
                    </button>
                </div>
                </div>
            )}
            </div>
        </div>
        <div className="w-full h-4/5 rounded-2xl bg-gray-500 mt-2"></div>
        {isRenaming && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <div className="bg-zinc-800 p-6 rounded-lg w-96">
                <h3 className="text-lg font-medium text-white mb-4">Rename File</h3>
                <input
                    type="text"
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    className="w-full p-2 mb-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:outline-none focus:border-blue-500"
                    autoFocus
                />
                {renameError && <p className="text-red-500 text-sm mb-3">{renameError}</p>}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                    onClick={() => setIsRenaming(false)}
                    className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600"
                    >
                    Cancel
                    </button>
                    <button
                    onClick={handleRename}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    >
                    Save
                    </button>
                </div>
                </div>
            </div>
        )}
        {isDeleting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <div className="bg-zinc-800 p-6 rounded-lg w-96">
                <h3 className="text-lg font-medium text-white mb-4">Delete File</h3>
                <p className="text-gray-300 mb-4">
                    Are you sure you want to delete &quot;{file.filename}&quot;? This action cannot be undone.
                </p>
                {deleteError && <p className="text-red-500 text-sm mb-3">{deleteError}</p>}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                    onClick={() => setIsDeleting(false)}
                    className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600"
                    >
                    Cancel
                    </button>
                    <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                    Delete
                    </button>
                </div>
                </div>
            </div>
        )}
        </div>
    );
}