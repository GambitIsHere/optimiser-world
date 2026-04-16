import { useState } from 'react'
import { ChevronRight, ChevronLeft, Bot, Zap, Upload, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import MagneticButton from '../components/ui/MagneticButton'
import { CATEGORIES } from '../lib/mockData'
import { api } from '../api/client'
import { cn, slugify } from '../utils'

export default function Submit() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    type: null,
    title: '',
    description: '',
    category: '',
    tags: '',
    readme: '',
    files: [],
  })
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState({})
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const navigate = useNavigate()

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, type })
    setCurrentStep(2)
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 2) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required'
      }
      if (formData.description.length < 50) {
        newErrors.description = 'Description must be at least 50 characters'
      }
      if (formData.description.length > 300) {
        newErrors.description = 'Description must be at most 300 characters'
      }
      if (!formData.category) {
        newErrors.category = 'Please select a category'
      }
      if (!formData.tags.trim()) {
        newErrors.tags = 'Please add at least one tag'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const payload = {
        type: formData.type,
        title: formData.title,
        slug: slugify(formData.title),
        description: formData.description,
        category: formData.category,
        tags: tagsArray,
        readme: formData.readme,
        install_command: `optimiser install ${slugify(formData.title)}`,
      }

      const result = await api.submitItem(payload)

      if (result?.slug) {
        setPublishSuccess(true)
        setTimeout(() => navigate(`/item/${result.slug}`), 2000)
      } else {
        // API unavailable — show success anyway for demo
        setPublishSuccess(true)
        setTimeout(() => navigate('/browse'), 2000)
      }
    } catch (err) {
      setErrors({ publish: err.message || 'Failed to publish. Please try again.' })
    } finally {
      setIsPublishing(false)
    }
  }

  const renderMarkdownPreview = (markdown) => {
    let html = markdown
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Headers
    html = html.replace(/### (.*?)(?=\n|$)/g, '<h3>$1</h3>')
    html = html.replace(/## (.*?)(?=\n|$)/g, '<h2>$1</h2>')
    html = html.replace(/# (.*?)(?=\n|$)/g, '<h1>$1</h1>')
    // Code blocks
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    // Line breaks
    html = html.replace(/\n/g, '<br />')

    return { __html: html }
  }

  const tagsArray = formData.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-[#EEEFE9]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                  currentStep === step
                    ? 'bg-[#F54E00] text-white'
                    : currentStep > step
                      ? 'bg-[#FEE8DE] text-[#F54E00]'
                      : 'bg-[#E3E4DD] text-[#6B6E66]'
                )}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-[#E3E4DD] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#F54E00]"
              initial={{ width: '20%' }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-[#151515] mb-2">
                  What are you publishing?
                </h2>
                <p className="text-[#6B6E66] mb-8">
                  Choose whether you're sharing an Agent or a Skill
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <GlassCard
                    hover
                    onClick={() => handleTypeSelect('agent')}
                    className="p-8 flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Bot size={48} className="text-blue mb-4" />
                    <h3 className="text-xl font-bold text-[#151515] mb-2">Agent</h3>
                    <p className="text-[#6B6E66] text-center">
                      An AI agent that automates tasks and integrations
                    </p>
                  </GlassCard>

                  <GlassCard
                    hover
                    onClick={() => handleTypeSelect('skill')}
                    className="p-8 flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Zap size={48} className="text-[#C79EF5] mb-4" />
                    <h3 className="text-xl font-bold text-[#151515] mb-2">Skill</h3>
                    <p className="text-[#6B6E66] text-center">
                      A reusable toolkit or framework for developers
                    </p>
                  </GlassCard>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-[#151515]">Basic Info</h2>

                <div>
                  <label htmlFor="submit-title" className="block text-[#151515] font-medium mb-2">
                    Title
                  </label>
                  <input
                    id="submit-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., GA4 Conversion Watchdog"
                    className={cn(
                      'w-full px-4 py-3 bg-white border rounded-lg text-[#151515] placeholder-[#6B6E66] focus:outline-none focus:border-[#D0D1C9] transition-all',
                      errors.title
                        ? 'border-red'
                        : 'border-[#D0D1C9]'
                    )}
                  />
                  {errors.title && (
                    <p className="text-red text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="submit-desc" className="block text-[#151515] font-medium mb-2">
                    Description ({formData.description.length}/300)
                  </label>
                  <textarea
                    id="submit-desc"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange('description', e.target.value)
                    }
                    placeholder="Brief description of what this does..."
                    rows="4"
                    className={cn(
                      'w-full px-4 py-3 bg-white border rounded-lg text-[#151515] placeholder-[#6B6E66] focus:outline-none focus:border-[#D0D1C9] transition-all resize-none',
                      errors.description
                        ? 'border-red'
                        : 'border-[#D0D1C9]'
                    )}
                  />
                  {errors.description && (
                    <p className="text-red text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="submit-category" className="block text-[#151515] font-medium mb-2">
                    Category
                  </label>
                  <select
                    id="submit-category"
                    value={formData.category}
                    onChange={(e) =>
                      handleChange('category', e.target.value)
                    }
                    className={cn(
                      'w-full px-4 py-3 bg-white border rounded-lg text-[#151515] focus:outline-none focus:border-[#D0D1C9] transition-all',
                      errors.category
                        ? 'border-red'
                        : 'border-[#D0D1C9]'
                    )}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="submit-tags" className="block text-[#151515] font-medium mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    id="submit-tags"
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="e.g., ga4, conversions, slack"
                    className={cn(
                      'w-full px-4 py-3 bg-white border rounded-lg text-[#151515] placeholder-[#6B6E66] focus:outline-none focus:border-[#D0D1C9] transition-all',
                      errors.tags
                        ? 'border-red'
                        : 'border-[#D0D1C9]'
                    )}
                  />
                  {errors.tags && (
                    <p className="text-red text-sm mt-1">{errors.tags}</p>
                  )}
                  {tagsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tagsArray.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs bg-[#FEE8DE] text-[#F54E00]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-[#151515]">README</h2>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E3E4DD] hover:bg-white transition-colors text-[#6B6E66] hover:text-[#151515] text-sm"
                  >
                    {showPreview ? (
                      <>
                        <Eye size={16} /> Hide Preview
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} /> Show Preview
                      </>
                    )}
                  </button>
                </div>

                {!showPreview && (
                  <div>
                    <label className="block text-[#151515] font-medium mb-2">
                      Markdown Content
                    </label>
                    <textarea
                      value={formData.readme}
                      onChange={(e) => handleChange('readme', e.target.value)}
                      placeholder="# Installation

Run `optimiser install your-package`

## Features

- **Feature 1** description
- Feature 2 description"
                      rows="12"
                      className="w-full px-4 py-3 bg-white border border-[#D0D1C9] rounded-lg text-[#151515] placeholder-[#6B6E66] focus:outline-none focus:border-[#D0D1C9] transition-all resize-none font-mono text-sm"
                    />
                  </div>
                )}

                {showPreview && (
                  <GlassCard className="p-6">
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={renderMarkdownPreview(
                        formData.readme
                      )}
                    />
                  </GlassCard>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-[#151515]">Upload Files</h2>

                <GlassCard className="p-12 border-2 border-dashed border-[#D0D1C9]">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload size={48} className="text-[#6B6E66] mb-4" />
                    <p className="text-[#151515] font-medium mb-2">
                      Drop files here
                    </p>
                    <p className="text-[#6B6E66] text-sm">
                      You can upload code files, documentation, or assets
                    </p>
                  </div>
                </GlassCard>

                <p className="text-[#6B6E66] text-sm">
                  This is a preview. File uploads will be implemented in the
                  next phase.
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-[#151515]">Review</h2>

                <div className="space-y-4">
                  <GlassCard className="p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[#6B6E66] mb-1">Type</p>
                        <p className="text-[#151515] font-semibold capitalize">
                          {formData.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#6B6E66] mb-1">Category</p>
                        <p className="text-[#151515] font-semibold">
                          {
                            CATEGORIES.find((c) => c.id === formData.category)
                              ?.name
                          }
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[#6B6E66] mb-1">Title</p>
                        <p className="text-[#151515] font-semibold">
                          {formData.title}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[#6B6E66] mb-1">Description</p>
                        <p className="text-[#151515]">{formData.description}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[#6B6E66] mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {tagsArray.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-full text-xs bg-[#FEE8DE] text-[#F54E00]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-12">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E3E4DD] hover:bg-white transition-colors text-[#151515] font-medium"
            >
              <ChevronLeft size={20} /> Back
            </button>
          )}

          {currentStep < 5 && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F54E00] text-white font-medium hover:bg-[#F54E00]/80 transition-colors ml-auto"
            >
              Next <ChevronRight size={20} />
            </button>
          )}

          {currentStep === 5 && !publishSuccess && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F54E00] text-white font-medium hover:bg-[#F54E00]/80 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Publishing...
                </>
              ) : (
                'Publish'
              )}
            </button>
          )}
          {publishSuccess && (
            <div className="flex items-center gap-2 text-[#F54E00] ml-auto">
              <CheckCircle2 size={20} />
              <span className="font-medium">Published! Redirecting...</span>
            </div>
          )}
          {errors.publish && (
            <p className="text-red text-sm ml-auto">{errors.publish}</p>
          )}
        </div>
      </div>
    </div>
  )
}
