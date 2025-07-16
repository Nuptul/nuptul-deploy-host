import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { adobeFontsService } from '@/services/adobeFonts';
import { createSafeRichTextHTML } from '@/utils/content-sanitizer';
import { logger } from '@/utils/logger';
import { 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  Palette, 
  Eye, 
  Save,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  placeholder?: string;
  fontFamily?: string;
  fontSize?: string;
  textColor?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  onSave,
  placeholder = "Enter your content...",
  fontFamily = "Inter",
  fontSize = "16px",
  textColor = "#000000",
  className = ""
}) => {
  const [content, setContent] = useState(value);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { toast } = useToast();

  // Available fonts for selection - Enhanced with Adobe Fonts
  const [fonts, setFonts] = useState([
    { name: 'Inter', family: 'Inter, sans-serif', category: 'sans-serif' as const },
    { name: 'Playfair Display', family: '"Playfair Display", serif', category: 'serif' as const },
    { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'sans-serif' as const },
    { name: 'Crimson Text', family: '"Crimson Text", serif', category: 'serif' as const },
    { name: 'Dancing Script', family: '"Dancing Script", cursive', category: 'script' as const },
    { name: 'Great Vibes', family: '"Great Vibes", cursive', category: 'script' as const },
    { name: 'Lato', family: 'Lato, sans-serif', category: 'sans-serif' as const },
    { name: 'Merriweather', family: 'Merriweather, serif', category: 'serif' as const }
  ]);

  // Load curated wedding fonts on component mount
  useEffect(() => {
    const weddingFonts = adobeFontsService.getCuratedWeddingFonts();
    setFonts(weddingFonts);
    
    // Load Google Fonts dynamically for wedding fonts
    const fontFamilies = [
      'Playfair+Display:400,500,600,700',
      'Dancing+Script:400,500,600,700',
      'Great+Vibes:400',
      'Pinyon+Script:400',
      'Alex+Brush:400',
      'Allura:400',
      'EB+Garamond:400,500,600,700',
      'Lora:400,500,600,700',
      'Poppins:300,400,500,600,700'
    ];
    
    const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(font => `family=${font}`).join('&')}&display=swap`;
    
    // Check if already loaded
    if (!document.querySelector(`link[href="${googleFontsUrl}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = googleFontsUrl;
      document.head.appendChild(link);
    }
  }, []);

  // Wedding-themed color palette
  const colorPalette = {
    neutrals: ['#000000', '#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#FFFFFF'],
    elegants: ['#B8860B', '#DAA520', '#FFD700', '#F4E4BC', '#DDD6C0', '#C7B377', '#8B7355', '#CD853F'],
    romantics: ['#8B0000', '#DC143C', '#FF6B8A', '#FFB6C1', '#FFC0CB', '#E6E6FA', '#DDA0DD', '#9370DB'],
    naturals: ['#228B22', '#32CD32', '#9ACD32', '#ADFF2F', '#7CFC00', '#98FB98', '#90EE90', '#F0FFF0'],
    classic: ['#191970', '#000080', '#0000CD', '#4169E1', '#6495ED', '#87CEEB', '#B0E0E6', '#F0F8FF']
  };

  useEffect(() => {
    setContent(value);
    setHasChanges(false);
  }, [value]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
    setHasChanges(newContent !== value);
  };

  const handleSave = () => {
    onSave();
    setHasChanges(false);
    toast({
      title: "Content Saved",
      description: `${label} has been updated successfully.`,
    });
  };

  // Rich text formatting functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const editor = document.getElementById(`editor-${label.replace(/\s+/g, '-')}`);
    if (editor) {
      handleContentChange(editor.innerHTML);
    }
  };

  const insertHeading = (level: number) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || 'Heading Text';
      const headingTag = `h${level}`;
      const headingElement = document.createElement(headingTag);
      headingElement.textContent = selectedText;
      headingElement.style.fontFamily = fontFamily;
      headingElement.style.fontSize = level === 1 ? '32px' : level === 2 ? '24px' : '20px';
      headingElement.style.fontWeight = 'bold';
      headingElement.style.margin = '16px 0 8px 0';
      
      range.deleteContents();
      range.insertNode(headingElement);
      
      const editor = document.getElementById(`editor-${label.replace(/\s+/g, '-')}`);
      if (editor) {
        handleContentChange(editor.innerHTML);
      }
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  const applyFont = (fontFamily: string) => {
    formatText('fontName', fontFamily);
    setShowFontPicker(false);
  };

  const applyColor = (color: string) => {
    formatText('foreColor', color);
    setShowColorPicker(false);
  };

  const editorStyle = {
    fontFamily: fontFamily,
    fontSize: fontSize,
    color: textColor,
    lineHeight: '1.6',
    minHeight: '200px'
  };

  const previewStyle = {
    ...editorStyle,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
    backdropFilter: 'blur(15px)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.4)'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-2">
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            variant={hasChanges ? 'default' : 'outline'}
            size="sm"
            className={hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Save className="w-4 h-4 mr-1" />
            {hasChanges ? 'Save' : 'Saved'}
          </Button>
        </div>
      </div>

      {!isPreviewMode ? (
        <>
          {/* Rich Text Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            {/* Text Formatting */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                className="hover:bg-white/20"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                className="hover:bg-white/20"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                className="hover:bg-white/20"
              >
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-white/30" />

            {/* Headings */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertHeading(1)}
                className="hover:bg-white/20"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertHeading(2)}
                className="hover:bg-white/20"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertHeading(3)}
                className="hover:bg-white/20"
              >
                <Heading3 className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-white/30" />

            {/* Alignment */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyLeft')}
                className="hover:bg-white/20"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyCenter')}
                className="hover:bg-white/20"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyRight')}
                className="hover:bg-white/20"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-white/30" />

            {/* Lists */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertUnorderedList')}
                className="hover:bg-white/20"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertOrderedList')}
                className="hover:bg-white/20"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertLink}
                className="hover:bg-white/20"
              >
                <Link className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-white/30" />

            {/* Font & Color */}
            <div className="flex gap-1 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFontPicker(!showFontPicker)}
                className="hover:bg-white/20"
              >
                <Type className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="hover:bg-white/20"
              >
                <Palette className="w-4 h-4" />
              </Button>

              {/* Font Picker Dropdown */}
              {showFontPicker && (
                <div className="absolute top-10 left-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-80 max-h-96 overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Wedding Typography Collection</div>
                  
                  {/* Group fonts by category */}
                  {['serif', 'script', 'sans-serif'].map(category => (
                    <div key={category} className="mb-4">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        {category === 'serif' ? '✨ Elegant Serif' : 
                         category === 'script' ? '💕 Script & Calligraphy' : 
                         '🎯 Clean Sans-Serif'}
                      </div>
                      {fonts.filter(font => font.category === category).map((font) => (
                        <button
                          key={font.name}
                          onClick={() => applyFont(font.family)}
                          className="block w-full text-left px-3 py-2 hover:bg-blue-50 rounded transition-colors"
                          style={{ fontFamily: font.family }}
                        >
                          <div className="font-medium">{font.name}</div>
                          <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: font.family }}>
                            The quick brown fox jumps over the lazy dog
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-400">
                      💡 Tip: Try different font combinations for headings and body text
                    </div>
                  </div>
                </div>
              )}

              {/* Color Picker Dropdown */}
              {showColorPicker && (
                <div className="absolute top-10 right-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64">
                  <div className="text-xs font-semibold text-gray-500 mb-3">Wedding Color Palette</div>
                  
                  {Object.entries(colorPalette).map(([categoryName, colors]) => (
                    <div key={categoryName} className="mb-3">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        {categoryName === 'neutrals' ? '⚫ Neutrals' :
                         categoryName === 'elegants' ? '✨ Gold & Elegant' :
                         categoryName === 'romantics' ? '💕 Romantic' :
                         categoryName === 'naturals' ? '🌿 Natural' :
                         '💙 Classic Blue'}
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => applyColor(color)}
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-400">
                      🎨 Pro tip: Use gold accents for headings, navy for body text
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rich Text Editor */}
          <div
            id={`editor-${label.replace(/\s+/g, '-')}`}
            contentEditable
            className="min-h-[200px] p-4 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={editorStyle}
            onInput={(e) => handleContentChange((e.target as HTMLElement).innerHTML)}
            {...createSafeRichTextHTML(content)}
            data-placeholder={placeholder}
          />
        </>
      ) : (
        /* Preview Mode */
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Preview with current styling:
          </div>
          <div 
            style={previewStyle}
            {...createSafeRichTextHTML(content || `<p style="color: #888;">${placeholder}</p>`)}
          />
        </div>
      )}

      {/* Word Count & Status */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {content.replace(/<[^>]*>/g, '').length} characters
        </span>
        {hasChanges && (
          <span className="text-orange-600">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;