"use client"

import { useState, useRef, ChangeEvent, FormEvent } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Upload,
    Folder,
    FolderPlus,
    File,
    FileText,
    Image,
    Trash2,
    Download,
    Search,
    Filter,
    Plus,
    Check,
    X,
    AlertTriangle,
    Eye,
    ChevronRight,
    FolderOpen
} from "lucide-react"

interface FileItem {
    id: number;
    nama_file: string;
    nama_asli: string;
    kategori: string;
    subfolder: string;
    file_type: string;
    file_size: number;
    is_public: boolean;
    is_template: boolean;
    download_count: number;
    created_at: string;
}

interface Subfolder {
    id: string;
    nama: string;
    parent: string;
    path: string;
    fileCount: number;
    deskripsi: string;
}

// Mock data for demonstration
const mockSubfolders: Subfolder[] = [
    { id: '1', nama: 'administrasi', parent: 'surat', path: 'templates/surat/administrasi', fileCount: 5, deskripsi: 'Template surat administrasi' },
    { id: '2', nama: 'keamanan', parent: 'surat', path: 'templates/surat/keamanan', fileCount: 2, deskripsi: 'Template laporan keamanan' },
    { id: '3', nama: 'iuran', parent: 'keuangan', path: 'dokumen/keuangan/iuran', fileCount: 12, deskripsi: 'Bukti iuran warga' },
    { id: '4', nama: 'laporan', parent: 'keuangan', path: 'dokumen/keuangan/laporan', fileCount: 3, deskripsi: 'Laporan keuangan bulanan' },
    { id: '5', nama: 'bukti', parent: 'keuangan', path: 'dokumen/keuangan/bukti', fileCount: 8, deskripsi: 'Bukti transaksi pengeluaran' },
];

const mockFiles: FileItem[] = [
    { id: 1, nama_file: 'template_kematian.docx', nama_asli: 'Surat Kematian.docx', kategori: 'surat', subfolder: 'administrasi', file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_size: 25600, is_public: true, is_template: true, download_count: 45, created_at: '2026-01-20' },
    { id: 2, nama_file: 'template_sktm.docx', nama_asli: 'SKTM.docx', kategori: 'surat', subfolder: 'administrasi', file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_size: 23400, is_public: true, is_template: true, download_count: 32, created_at: '2026-01-20' },
    { id: 3, nama_file: 'laporan_jan_2026.pdf', nama_asli: 'Laporan Januari 2026.pdf', kategori: 'keuangan', subfolder: 'laporan', file_type: 'application/pdf', file_size: 156000, is_public: true, is_template: false, download_count: 18, created_at: '2026-01-24' },
];

export default function AdminFilesPage() {
    const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);
    const [files, setFiles] = useState<FileItem[]>(mockFiles);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        kategori: 'surat',
        subfolder: 'administrasi',
        deskripsi: '',
        isPublic: false,
        isTemplate: false,
    });

    // New folder form state
    const [newFolderForm, setNewFolderForm] = useState({
        nama: '',
        parent: 'surat',
        deskripsi: '',
    });

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('image')) return <Image className="h-5 w-5 text-green-400" />;
        if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-400" />;
        if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-blue-400" />;
        return <File className="h-5 w-5 text-gray-400" />;
    };

    const filteredFiles = files.filter(f => {
        const matchesSubfolder = !selectedSubfolder || f.subfolder === selectedSubfolder;
        const matchesSearch = f.nama_asli.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.subfolder.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSubfolder && matchesSearch;
    });

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            // Handle file upload simulation
            simulateUpload();
        }
    };

    const simulateUpload = () => {
        setIsUploading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    setShowUploadModal(false);
                    // Add mock file
                    const newFile: FileItem = {
                        id: files.length + 1,
                        nama_file: 'new_file.pdf',
                        nama_asli: 'File Baru.pdf',
                        kategori: uploadForm.kategori,
                        subfolder: uploadForm.subfolder,
                        file_type: 'application/pdf',
                        file_size: 50000,
                        is_public: uploadForm.isPublic,
                        is_template: uploadForm.isTemplate,
                        download_count: 0,
                        created_at: new Date().toISOString().split('T')[0],
                    };
                    setFiles(prev => [newFile, ...prev]);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const handleCreateFolder = (e: FormEvent) => {
        e.preventDefault();
        // In production, this would call the API
        alert(`Subfolder "${newFolderForm.nama}" akan dibuat di ${newFolderForm.parent}`);
        setShowNewFolderModal(false);
        setNewFolderForm({ nama: '', parent: 'surat', deskripsi: '' });
    };

    const handleDeleteFile = (fileId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus file ini?')) {
            setFiles(prev => prev.filter(f => f.id !== fileId));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/admin">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">File Manager</h1>
                            <p className="text-gray-400">Kelola file dan template surat</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowNewFolderModal(true)}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Subfolder Baru
                        </Button>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar - Subfolder List */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10 sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <Folder className="h-5 w-5 text-yellow-400" />
                                    Subfolder
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <button
                                    onClick={() => setSelectedSubfolder(null)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedSubfolder === null
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-white/10 text-gray-300'
                                        }`}
                                >
                                    <FolderOpen className="h-4 w-4" />
                                    <span>Semua File</span>
                                    <span className="ml-auto text-xs opacity-70">{files.length}</span>
                                </button>

                                {/* Group by parent */}
                                {['surat', 'keuangan', 'warga'].map(parent => {
                                    const parentSubfolders = mockSubfolders.filter(sf => sf.parent === parent);
                                    if (parentSubfolders.length === 0) return null;

                                    return (
                                        <div key={parent} className="pt-2">
                                            <div className="text-xs text-gray-500 uppercase px-3 mb-1">{parent}</div>
                                            {parentSubfolders.map(sf => (
                                                <button
                                                    key={sf.id}
                                                    onClick={() => setSelectedSubfolder(sf.nama)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedSubfolder === sf.nama
                                                            ? 'bg-blue-600 text-white'
                                                            : 'hover:bg-white/10 text-gray-300'
                                                        }`}
                                                >
                                                    <Folder className="h-4 w-4 text-yellow-400" />
                                                    <span className="truncate">{sf.nama}</span>
                                                    <span className="ml-auto text-xs opacity-70">{sf.fileCount}</span>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - File List */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Search & Filter */}
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari file..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <button onClick={() => setSelectedSubfolder(null)} className="hover:text-white">
                                Root
                            </button>
                            {selectedSubfolder && (
                                <>
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="text-white">{selectedSubfolder}</span>
                                </>
                            )}
                        </div>

                        {/* File Grid */}
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredFiles.map(file => (
                                <Card key={file.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-3 bg-white/10 rounded-lg">
                                                {getFileIcon(file.file_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-white truncate">{file.nama_asli}</h4>
                                                <p className="text-xs text-gray-500">{file.subfolder}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-gray-400">{formatFileSize(file.file_size)}</span>
                                                    <span className="text-xs text-gray-600">•</span>
                                                    <span className="text-xs text-gray-400">{file.download_count} download</span>
                                                </div>
                                                <div className="flex gap-1 mt-2">
                                                    {file.is_public && (
                                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded">Public</span>
                                                    )}
                                                    {file.is_template && (
                                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded">Template</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                            <Button size="sm" variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                                                <Eye className="h-3 w-3 mr-1" />
                                                View
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                                onClick={() => handleDeleteFile(file.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredFiles.length === 0 && (
                            <div className="text-center py-12">
                                <Folder className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-400">Folder Kosong</h3>
                                <p className="text-gray-500">Belum ada file di folder ini</p>
                                <Button
                                    onClick={() => setShowUploadModal(true)}
                                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload File Pertama
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg bg-slate-800 border-white/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-blue-400" />
                                    Upload File
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                            >
                                {isUploading ? (
                                    <div className="space-y-3">
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-gray-400">Uploading... {uploadProgress}%</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                                        <p className="text-gray-400">Klik atau drag file ke sini</p>
                                        <p className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG, PNG (max 10MB)</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                            />

                            {/* Form Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                                    <select
                                        value={uploadForm.kategori}
                                        onChange={(e) => setUploadForm({ ...uploadForm, kategori: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                                    >
                                        <option value="surat" className="bg-slate-800">Surat</option>
                                        <option value="keuangan" className="bg-slate-800">Keuangan</option>
                                        <option value="administrasi" className="bg-slate-800">Administrasi</option>
                                        <option value="keamanan" className="bg-slate-800">Keamanan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Subfolder</label>
                                    <select
                                        value={uploadForm.subfolder}
                                        onChange={(e) => setUploadForm({ ...uploadForm, subfolder: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                                    >
                                        {mockSubfolders.map(sf => (
                                            <option key={sf.id} value={sf.nama} className="bg-slate-800">
                                                {sf.parent}/{sf.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Deskripsi (opsional)</label>
                                <textarea
                                    value={uploadForm.deskripsi}
                                    onChange={(e) => setUploadForm({ ...uploadForm, deskripsi: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white resize-none h-20"
                                    placeholder="Deskripsi file..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={uploadForm.isPublic}
                                        onChange={(e) => setUploadForm({ ...uploadForm, isPublic: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-300">File Public</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={uploadForm.isTemplate}
                                        onChange={(e) => setUploadForm({ ...uploadForm, isTemplate: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-300">Ini Template</span>
                                </label>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-white/10 pt-4">
                            <Button
                                onClick={() => setShowUploadModal(false)}
                                variant="outline"
                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 ml-2 bg-blue-600 hover:bg-blue-700"
                                disabled={isUploading}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Pilih File
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md bg-slate-800 border-white/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <FolderPlus className="h-5 w-5 text-yellow-400" />
                                    Subfolder Baru
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewFolderModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <form onSubmit={handleCreateFolder}>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nama Subfolder</label>
                                    <input
                                        type="text"
                                        value={newFolderForm.nama}
                                        onChange={(e) => setNewFolderForm({ ...newFolderForm, nama: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                                        placeholder="contoh: bukti_transaksi"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Parent Folder</label>
                                    <select
                                        value={newFolderForm.parent}
                                        onChange={(e) => setNewFolderForm({ ...newFolderForm, parent: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                                    >
                                        <option value="surat" className="bg-slate-800">surat</option>
                                        <option value="keuangan" className="bg-slate-800">keuangan</option>
                                        <option value="warga" className="bg-slate-800">warga</option>
                                        <option value="keamanan" className="bg-slate-800">keamanan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                                    <textarea
                                        value={newFolderForm.deskripsi}
                                        onChange={(e) => setNewFolderForm({ ...newFolderForm, deskripsi: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white resize-none h-20"
                                        placeholder="Deskripsi subfolder..."
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-white/10 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowNewFolderModal(false)}
                                    variant="outline"
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 ml-2 bg-yellow-600 hover:bg-yellow-700"
                                >
                                    <FolderPlus className="h-4 w-4 mr-2" />
                                    Buat Folder
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
