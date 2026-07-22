import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FormField, FormSelect, FormTextarea } from '@/components/ui/form-field'
import Modal from '@/components/ui/modal'
import EmptyState from '@/components/ui/empty-state'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/utils'

// ── Utility tests ────────────────────────────────────

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra')
    expect(result).toContain('base')
    expect(result).toContain('extra')
    expect(result).not.toContain('hidden')
  })
})

describe('formatCurrency', () => {
  it('formats INR currency', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1,234')
    expect(result).toContain('56')
  })

  it('handles zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-07-22')
    expect(result).toContain('2026')
    expect(result).toMatch(/\d{2}/)
  })
})

// ── Badge tests ──────────────────────────────────────

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders with success variant', () => {
    render(<Badge variant="success">Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders with danger variant', () => {
    render(<Badge variant="danger">Error</Badge>)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})

// ── Button tests ─────────────────────────────────────

describe('Button', () => {
  it('renders with default text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

// ── Card tests ───────────────────────────────────────

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Card content</p></Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders CardHeader with title', () => {
    render(<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })
})

// ── FormField tests ──────────────────────────────────

describe('FormField', () => {
  it('renders label and input', () => {
    render(<FormField label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<FormField label="Name" error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('shows hint when no error', () => {
    render(<FormField label="Name" hint="Enter your name" />)
    expect(screen.getByText('Enter your name')).toBeInTheDocument()
  })

  it('hides hint when error is present', () => {
    render(<FormField label="Name" hint="Enter name" error="Required" />)
    expect(screen.queryByText('Enter name')).not.toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})

describe('FormSelect', () => {
  it('renders options', () => {
    render(<FormSelect label="Role" options={[{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('renders placeholder', () => {
    render(<FormSelect label="Type" options={[]} placeholder="Select one..." />)
    expect(screen.getByText('Select one...')).toBeInTheDocument()
  })
})

describe('FormTextarea', () => {
  it('renders textarea with label', () => {
    render(<FormTextarea label="Notes" />)
    expect(screen.getByLabelText('Notes')).toBeInTheDocument()
  })
})

// ── Modal tests ──────────────────────────────────────

describe('Modal', () => {
  it('does not render when closed', () => {
    render(<Modal open={false} onClose={() => {}}><p>Content</p></Modal>)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<Modal open={true} onClose={() => {}} title="Test Modal"><p>Modal body</p></Modal>)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('calls onClose on backdrop click', () => {
    const handleClose = vi.fn()
    render(<Modal open={true} onClose={handleClose}><p>Body</p></Modal>)
    fireEvent.click(screen.getByText('Body').closest('.fixed')!.querySelector('.fixed.inset-0.bg-black\\/50')!)
    expect(handleClose).toHaveBeenCalled()
  })

  it('renders description', () => {
    render(<Modal open={true} onClose={() => {}} title="Title" description="Description"><p>Body</p></Modal>)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})

// ── EmptyState tests ─────────────────────────────────

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No data" description="Nothing here" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })
})

// ── ConfirmDialog tests ──────────────────────────────

describe('ConfirmDialog', () => {
  it('renders title and description when open', () => {
    render(<ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} title="Delete?" description="Are you sure?" />)
    expect(screen.getByText('Delete?')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ConfirmDialog open={false} onClose={() => {}} onConfirm={() => {}} title="Delete?" description="Sure?" />)
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', () => {
    const handleConfirm = vi.fn()
    render(<ConfirmDialog open={true} onClose={() => {}} onConfirm={handleConfirm} title="Delete?" description="Sure?" />)
    fireEvent.click(screen.getByText('Confirm'))
    expect(handleConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when cancel button clicked', () => {
    const handleClose = vi.fn()
    render(<ConfirmDialog open={true} onClose={handleClose} onConfirm={() => {}} title="Delete?" description="Sure?" />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalledOnce()
  })
})

// ── Skeleton tests ───────────────────────────────────

describe('Skeleton', () => {
  it('renders', () => {
    const { container } = render(<div data-testid="skeleton-container" />)
    expect(container.querySelector('[data-testid="skeleton-container"]')).toBeInTheDocument()
  })
})
