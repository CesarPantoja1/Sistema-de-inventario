/**
 * Componentes de Tabla reutilizables
 */
import { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

interface TableHeaderProps {
  children: ReactNode
}

interface TableBodyProps {
  children: ReactNode
}

interface TableRowProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  hoverable?: boolean
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

interface TableHeadCellProps {
  children: ReactNode
  className?: string
  sortable?: boolean
  sorted?: 'asc' | 'desc' | null
  onSort?: () => void
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      {children}
    </thead>
  )
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  )
}

export function TableRow({ children, onClick, className = '', hoverable = false }: TableRowProps) {
  return (
    <tr
      className={`
        ${onClick ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''}
        ${hoverable ? 'hover:bg-gray-50 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  )
}

export function TableHeadCell({ children, className = '', sortable, sorted, onSort }: TableHeadCellProps) {
  return (
    <th
      className={`
        px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider
        ${sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <span className="text-gray-400">
            {sorted === 'asc' && (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
            {sorted === 'desc' && (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {!sorted && (
              <svg className="h-4 w-4 opacity-0 group-hover:opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  )
}

// Componente para estado vacío
export function TableEmpty({ message = 'No hay datos disponibles', description, icon }: { message?: string; description?: string; icon?: ReactNode }) {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          {icon || (
            <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
          <p className="text-gray-500 text-sm">{message}</p>
          {description && <p className="text-gray-400 text-xs mt-1">{description}</p>}
        </div>
      </td>
    </tr>
  )
}

// Componente para loading
export function TableLoading({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
