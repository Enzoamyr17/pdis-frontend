# Module Styling Guide - PDIS Frontend

This document outlines the comprehensive styling standards and design system for all modules in the ProjectDuo Information System (PDIS) frontend application.

## Table of Contents
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Layout Structure](#layout-structure)
- [Form Components](#form-components)
- [Module Templates](#module-templates)
- [Icon Guidelines](#icon-guidelines)
- [Responsive Design](#responsive-design)
- [Implementation Examples](#implementation-examples)

## Color Palette

### Primary Colors
```css
/* Blue Variants - Primary Brand Color */
text-blue           /* Solid blue for icons and primary elements */
text-blue/90        /* 90% opacity - Main headings and labels */
text-blue/70        /* 70% opacity - Secondary text and descriptions */

/* Orange Variants - Accent/Action Color */
text-orange         /* Solid orange for accent elements */
bg-orange/10        /* 10% opacity - Light background highlights */
border-orange/20    /* 20% opacity - Subtle borders */
focus:ring-orange   /* Focus states on interactive elements */
```

### Background Colors
```css
/* Main Container Gradients */
bg-gradient-to-t from-blue/5 to-light-blue/25   /* Primary module container */

/* Section Backgrounds */
bg-white/50         /* Form sections with 50% white opacity */
bg-white/70         /* Content cards with 70% white opacity */
bg-white/90         /* Input fields with 90% white opacity */

/* Status Backgrounds */
bg-orange/10        /* "Coming Soon" badges and highlights */
bg-zinc-100         /* Disabled input fields */
```

### Border Colors
```css
border-zinc-300     /* Standard form element borders */
border-zinc-200     /* Disabled element borders */
border-orange       /* Active/selected element borders */
border-orange/20    /* Subtle accent borders */
```

## Typography

### Font Sizes and Weights
```css
/* Module Headers */
text-2xl font-semibold text-blue/90    /* Main module title (h1) */
text-sm font-semibold text-blue/90     /* Section headers (h2) */

/* Form Labels */
text-xs font-medium text-blue/90 mb-1  /* All form field labels */

/* Body Text */
text-sm             /* Input field text and general content */
text-xl font-medium text-blue/90       /* "Coming Soon" module titles */
text-blue/70        /* Description text in "Coming Soon" modules */

/* Interactive Elements */
text-xs             /* Button text and small interactive elements */
```

### Text Colors by Context
```css
/* Primary Text */
text-blue/90        /* Main headings, labels, important text */
text-blue/70        /* Secondary text, descriptions */

/* Interactive States */
text-orange         /* Active states, "Coming Soon" badges */
text-zinc-500       /* Disabled text */
text-red-600        /* Error messages */
text-green-600      /* Success messages */
```

## Layout Structure

### Module Container Pattern
```jsx
<div className="h-full p-4 overflow-auto">
  {/* Module Header */}
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-6 h-6 text-blue" />
    <h1 className="text-2xl font-semibold text-blue/90">Module Title</h1>
  </div>
  
  {/* Main Content Container */}
  <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
    <form className="p-4 space-y-4">
      {/* Content sections here */}
    </form>
  </div>
</div>
```

### Section Structure
```jsx
{/* Form Section */}
<div className="p-3 bg-white/50 rounded border mb-4">
  <div className="flex items-center gap-2 mb-2">
    <Icon className="w-4 h-4 text-blue" />
    <h2 className="text-sm font-semibold text-blue/90">Section Title</h2>
  </div>
  {/* Section content */}
</div>
```

## Form Components

### Input Fields
```jsx
// Standard Input Classes
const inputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"

// Disabled Input Classes
const disabledInputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed"

// Label Classes
const labelClasses = "block text-xs font-medium text-blue/90 mb-1"
```

### Grid Layouts
```jsx
{/* Responsive Grid - 3 columns on desktop, adaptive on smaller screens */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
  {/* Grid items */}
</div>

{/* For form sections with consistent spacing */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white/50 rounded border">
  {/* Form fields */}
</div>
```

### Buttons
```jsx
{/* Primary Button */}
<button className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white font-medium rounded hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors">
  <Icon className="w-4 h-4" />
  Button Text
</button>

{/* Secondary Button */}
<button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue text-white rounded hover:bg-blue/80">
  <Icon className="w-3 h-3" />
  Small Button
</button>
```

## Module Templates

### Functional Module Template
```jsx
"use client"

import { useState } from "react"
import { Icon, Save, Plus, Trash2 } from "lucide-react"

export default function ModuleName() {
  const [formData, setFormData] = useState({
    // form state
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form Data:', formData)
    alert('Form submitted successfully!')
  }

  const inputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"
  const disabledInputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed"
  const labelClasses = "block text-xs font-medium text-blue/90 mb-1"

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-6 h-6 text-blue" />
        <h1 className="text-2xl font-semibold text-blue/90">Module Title</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Form sections */}
        </form>
      </div>
    </div>
  )
}
```

### "Coming Soon" Module Template
```jsx
"use client"

import { Icon } from "lucide-react"

export default function ModuleName() {
  return (
    <div className="h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-6 h-6 text-blue" />
        <h1 className="text-2xl font-semibold text-blue/90">Module Title</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
        <div className="p-4">
          <div className="text-center py-12">
            <Icon className="w-16 h-16 text-blue mx-auto mb-4" />
            <h2 className="text-xl font-medium text-blue/90 mb-2">Module Title</h2>
            <p className="text-blue/70 mb-6">Module description and features...</p>
            <div className="inline-flex items-center px-4 py-2 bg-orange/10 border border-orange/20 rounded-lg">
              <svg className="w-4 h-4 text-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-orange font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Icon Guidelines

### Icon Sizing
```css
/* Module Header Icons */
w-6 h-6             /* Main module title icons */

/* Section Header Icons */
w-4 h-4             /* Section title icons */

/* Button Icons */
w-4 h-4             /* Standard button icons */
w-3 h-3             /* Small button icons */

/* Large Display Icons */
w-16 h-16           /* "Coming Soon" module display icons */
```

### Icon Colors
```css
text-blue           /* Standard icon color */
text-orange         /* Accent/active state icons */
text-zinc-500       /* Disabled icons */
text-red-600        /* Error state icons */
text-green-600      /* Success state icons */
```

## Responsive Design

### Breakpoint Usage
```css
/* Mobile First Approach */
grid-cols-1                    /* Base: 1 column */
md:grid-cols-2                 /* Medium screens: 2 columns */
lg:grid-cols-3                 /* Large screens: 3 columns */

/* Common responsive patterns */
md:grid-cols-3 gap-3           /* 3 columns with gaps on medium+ */
grid-cols-2 md:grid-cols-4 lg:grid-cols-7  /* Adaptive column count */
```

### Container Constraints
```css
/* Module containers */
h-full p-4 overflow-auto       /* Full height with scrolling */
min-w-[32rem]                  /* Minimum width for complex forms */
```

## Implementation Examples

### Complete Form Section
```jsx
{/* Project Information Section */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white/50 rounded border">
  <div className="flex items-center gap-2 mb-2 md:col-span-3">
    <Building className="w-4 h-4 text-blue" />
    <h2 className="text-sm font-semibold text-blue/90">Project Information</h2>
  </div>
  
  <div>
    <label className={labelClasses}>Project Name</label>
    <select
      name="projectName"
      value={formData.projectName}
      onChange={handleInputChange}
      className={inputClasses}
      required
    >
      <option value="">Select Project</option>
      {/* Options */}
    </select>
  </div>
  
  {/* Additional fields */}
</div>
```

### Dynamic List with Cards
```jsx
{/* Personnel List */}
{personnelList.map((person, index) => (
  <div key={person.id} className="mb-6 p-4 bg-white/70 rounded-lg border-l-4 border-orange shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-blue/90">Personnel #{index + 1}</h3>
      {personnelList.length > 1 && (
        <button
          type="button"
          onClick={() => removePersonnel(person.id)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-3 h-3" />
          Remove
        </button>
      )}
    </div>
    {/* Card content */}
  </div>
))}
```

## Best Practices

### Consistency Rules
1. **Always use the standardized class constants** for inputs, labels, and containers
2. **Maintain consistent icon sizing** based on context (header, section, button)
3. **Use the blue/orange color scheme** throughout all modules
4. **Apply proper spacing** with `gap-2 mb-4` for headers, `gap-3` for grids
5. **Include proper accessibility** with required fields, proper labels, and focus states

### Performance Considerations
1. **Use CSS classes efficiently** - define reusable class constants
2. **Implement proper form validation** with visual feedback
3. **Ensure responsive design** works across all screen sizes
4. **Optimize for touch interfaces** with adequate button sizes

### Code Organization
1. **Define class constants** at the top of each component
2. **Group related form fields** in logical sections
3. **Use consistent naming** for state variables and handlers
4. **Implement proper TypeScript** interfaces for form data

This styling guide ensures visual consistency and maintainability across all PDIS frontend modules while providing a professional user experience.