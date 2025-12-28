import { FC } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

const SearchBar: FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
}) => {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ fontSize: '0.7rem' }}
                className="flex-1 bg-transparent outline-none"
            />
        </div>
    )
}

export default SearchBar
