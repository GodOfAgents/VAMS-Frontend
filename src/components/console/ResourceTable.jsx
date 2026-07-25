import { Link } from 'react-router-dom'
import { StatusBadge } from '../ui/StatusBadge.jsx'

export function ResourceTable({ columns, rows, linkPrefix, label }) {
  return (
    <div className="table-scroll">
      <table className="resource-table">
        <caption>{label}</caption>
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              className="resource-row"
              key={row.id}
              style={{ '--row-delay': `${Math.min(rowIndex * 32, 320)}ms` }}
            >
              {columns.map((column, index) => {
                const value = column.render ? column.render(row) : row[column.key]
                const content = column.status ? <StatusBadge state={value} /> : value
                return <td key={column.key}>{index === 0 && linkPrefix ? <Link to={`${linkPrefix}/${encodeURIComponent(row.id)}`}>{content}</Link> : content}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
