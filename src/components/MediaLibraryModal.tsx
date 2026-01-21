"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_BASE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } from "../config/api"
import axios from "axios"

interface MediaImage {
  id: number
  src: string
  alt: string
}

interface MediaLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (images: MediaImage[]) => void
  multiple?: boolean
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect, multiple = false }: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library")
  const [selectedImages, setSelectedImages] = useState<MediaImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ["media-library", searchTerm],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/wp/v2/media`, {
        params: {
          per_page: 50,
          search: searchTerm || undefined,
          media_type: "image",
        },
        auth: {
          username: WC_CONSUMER_KEY,
          password: WC_CONSUMER_SECRET,
        },
      })
      return response.data.map((item: any) => ({
        id: item.id,
        src: item.source_url,
        alt: item.alt_text || item.title?.rendered || "",
      }))
    },
    enabled: isOpen,
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", file.name)

      const response = await axios.post(`${API_BASE_URL}/wp/v2/media`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        auth: {
          username: WC_CONSUMER_KEY,
          password: WC_CONSUMER_SECRET,
        },
      })

      return {
        id: response.data.id,
        src: response.data.source_url,
        alt: response.data.alt_text || response.data.title?.rendered || "",
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] })
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map((file) => uploadMutation.mutateAsync(file))
      const uploadedImages = await Promise.all(uploadPromises)

      if (multiple) {
        setSelectedImages([...selectedImages, ...uploadedImages])
      } else {
        setSelectedImages(uploadedImages.slice(0, 1))
      }
      setActiveTab("library")
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
  }

  const toggleImageSelection = (image: MediaImage) => {
    if (multiple) {
      const isSelected = selectedImages.some((img) => img.id === image.id)
      if (isSelected) {
        setSelectedImages(selectedImages.filter((img) => img.id !== image.id))
      } else {
        setSelectedImages([...selectedImages, image])
      }
    } else {
      setSelectedImages([image])
    }
  }

  const handleSelect = () => {
    onSelect(selectedImages)
    setSelectedImages([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Media Library</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "library"
                  ? "text-green-600 border-green-600"
                  : "text-gray-600 border-transparent hover:text-gray-800"
              }`}
            >
              Media Library
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "upload"
                  ? "text-green-600 border-green-600"
                  : "text-gray-600 border-transparent hover:text-gray-800"
              }`}
            >
              Upload Files
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "library" && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search media..."
                  className="input max-w-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading media...</div>
              ) : mediaItems?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No media found. Upload some images to get started.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {mediaItems?.map((image: MediaImage) => {
                    const isSelected = selectedImages.some((img) => img.id === image.id)
                    return (
                      <button
                        key={image.id}
                        onClick={() => toggleImageSelection(image)}
                        className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-green-600 ring-2 ring-green-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image.src || "/placeholder.svg"}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "upload" && (
            <div className="text-center py-12">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full max-w-md mx-auto h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                {uploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p>Uploading...</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-lg font-medium">Drop files here or click to upload</p>
                    <p className="text-sm text-gray-400 mt-2">Supported: JPG, PNG, GIF</p>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedImages.length} {selectedImages.length === 1 ? "image" : "images"} selected
          </p>
          <div className="flex gap-4">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSelect} disabled={selectedImages.length === 0} className="btn btn-primary">
              {multiple ? "Insert Images" : "Select Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
