import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog'
import { BookOpen, Video, FileText, Link, ExternalLink } from 'lucide-react'

const ResourcesDialog = ({ open, onOpenChange, selectedResources }) => {
    const getResourceIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'video':
                return <Video className="w-4 h-4" />
            case 'article':
            case 'blog':
                return <FileText className="w-4 h-4" />
            case 'link':
            case 'website':
                return <Link className="w-4 h-4" />
            default:
                return <ExternalLink className="w-4 h-4" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" />

            <DialogContent className="w-[95%] sm:w-[90%] md:w-[80%] lg:max-w-2xl max-h-[85vh] overflow-y-auto z-[9999] rounded-2xl bg-white shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                        <BookOpen className="w-5 h-5 text-green-500" />
                        <span>Resources: {selectedResources.groupLabel}</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm sm:text-base">
                        Helpful resources and materials for this task group
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {selectedResources.resources && selectedResources.resources.length > 0 ? (
                        selectedResources.resources.map((resource, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-green-300 transition-colors bg-white shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2 mb-2">
                                            <div className="text-green-500">
                                                {getResourceIcon(resource.type)}
                                            </div>
                                            <h4 className="font-medium text-gray-800 truncate">
                                                {resource.title}
                                            </h4>
                                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                                {resource.type || 'Resource'}
                                            </span>
                                        </div>
                                        {resource.description && (
                                            <p className="text-gray-600 text-sm mb-2 sm:mb-3">
                                                {resource.description}
                                            </p>
                                        )}
                                        {resource.url && (
                                            <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                                            >
                                                <span>Open Resource</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm sm:text-base">
                                No resources available for this task group
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ResourcesDialog