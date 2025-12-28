import { FC } from 'react'
import { ChevronRight } from 'lucide-react'
import Text from './Text'

interface PathProps {
    path: string[]
    onNavigate: (index: number) => void
}

const Path: FC<PathProps> = ({ path, onNavigate }) => {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            {path.map((segment, index) => (
                <div key={index} className="flex items-center gap-2">
                    <button
                        onClick={() => onNavigate(index)}
                        className="hover:text-blue-600 transition-colors"
                    >
                        <Text variant="body">{segment}</Text>
                    </button>
                    {index < path.length - 1 && (
                        <ChevronRight size={16} className="text-gray-400" />
                    )}
                </div>
            ))}
        </div>
    )
}

export default Path
