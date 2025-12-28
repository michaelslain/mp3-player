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
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
            <Search size={16} className="text-gray-500" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ fontSize: '0.7rem' }}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            />
        </div>
    )
}

export default SearchBar
