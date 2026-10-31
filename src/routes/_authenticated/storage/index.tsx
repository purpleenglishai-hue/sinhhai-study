import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage'

function StoragePage() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [files, setFiles] = useState<{ name: string; url: string; size: string }[]>([])

  // Khởi tạo Firebase Storage (hoặc import từ file config chung của project)
  const storage = getStorage()

  // Lấy danh sách file đã tải lên từ Firebase Storage
  const fetchFiles = async () => {
    try {
      const listRef = ref(storage, 'documents/')
      const res = await listAll(listRef)
      const filePromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef)
        return { name: itemRef.name, url, size: 'N/A' }
      })
      const resolvedFiles = await Promise.all(filePromises)
      setFiles(resolvedFiles)
    } catch (error) {
      console.error("Lỗi khi tải danh sách file:", error)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // Xử lý sự kiện chọn và upload file lên Firebase
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(Math.round(prog))
      },
      (error) => {
        console.error("Upload failed:", error)
        setUploading(false)
      },
      async () => {
        await getDownloadURL(uploadTask.snapshot.ref)
        setUploading(false)
        setProgress(0)
        fetchFiles() // Làm mới danh sách file sau khi upload thành công
      }
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-col flex-1 p-6'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Kho tài liệu (Storage)</h1>
            <p className='text-muted-foreground'>Tải lên và quản lý tài liệu học tập cá nhân của bạn.</p>
          </div>
          <label className='cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition'>
            {uploading ? `Đang tải lên (${progress}%)...` : '+ Tải tài liệu lên'}
            <input type='file' className='hidden' onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {/* Khu vực hiển thị danh sách tài liệu */}
        <div className='bg-card border rounded-lg p-4 shadow-sm'>
          <h2 className='text-lg font-semibold mb-4'>Tài liệu đã lưu trữ</h2>
          {files.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>Chưa có tài liệu nào trong kho. Hãy nhấn nút tải lên ở góc phải.</p>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {files.map((file, index) => (
                <div key={index} className='border p-4 rounded-md flex flex-col justify-between bg-background'>
                  <span className='font-medium truncate mb-2'>{file.name}</span>
                  <a
                    href={file.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-blue-600 hover:underline mt-auto inline-block'
                  >
                    Xem / Tải xuống tệp →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/storage')({
  component: StoragePage,
})
