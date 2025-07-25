import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Plus, 
  X, 
  Calendar,
  Clock,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import styles from '@/components/dashboard/dashboard.module.css';

interface PollOption {
  id: string;
  text: string;
}

interface PollData {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  duration: number; // in hours
}

interface PollCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (poll: PollData) => void;
}

const PollCreator: React.FC<PollCreatorProps> = ({
  isOpen,
  onClose,
  onCreatePoll
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [duration, setDuration] = useState(24); // Default 24 hours

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { id: Date.now().toString(), text: '' }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handleCreate = () => {
    const validOptions = options.filter(opt => opt.text.trim());
    if (question.trim() && validOptions.length >= 2) {
      onCreatePoll({
        question: question.trim(),
        options: validOptions,
        allowMultiple,
        duration
      });
      // Reset form
      setQuestion('');
      setOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
      setAllowMultiple(false);
      setDuration(24);
      onClose();
    }
  };

  const isValid = question.trim() && options.filter(opt => opt.text.trim()).length >= 2;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`w-full max-w-lg ${styles.liquidGlassCard}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(30px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(126, 34, 206, 0.1) 100%)',
                border: '1px solid rgba(147, 51, 234, 0.3)'
              }}>
                <BarChart3 className="w-5 h-5" style={{ color: '#9333ea' }} />
              </div>
              <h2 className="text-xl font-semibold" style={{
                fontFamily: '"Bodoni Moda", serif',
                color: '#000000'
              }}>
                Create a Poll
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: '#6b7280' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Question */}
            <div>
              <Label htmlFor="question" className="mb-2 block">
                Ask a question
              </Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to ask?"
                className="text-base"
                style={{
                  fontFamily: '"Montserrat", sans-serif',
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {question.length}/100
              </p>
            </div>

            {/* Options */}
            <div>
              <Label className="mb-2 block">Poll Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm font-medium w-6" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                      {index + 1}.
                    </span>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      style={{
                        fontFamily: '"Montserrat", sans-serif',
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                      }}
                      maxLength={50}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(option.id)}
                        className="rounded-full p-1 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" style={{ color: '#ef4444' }} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {options.length < 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-3 p-4 rounded-lg" style={{
              background: 'rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                <Settings className="w-4 h-4" />
                Poll Settings
              </div>

              {/* Multiple choice */}
              <div className="flex items-center justify-between">
                <Label htmlFor="multiple" className="text-sm cursor-pointer">
                  Allow multiple answers
                </Label>
                <Switch
                  id="multiple"
                  checked={allowMultiple}
                  onCheckedChange={setAllowMultiple}
                />
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration" className="text-sm mb-1 block">
                  Poll duration
                </Label>
                <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">1 day</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!isValid}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              Create Poll
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PollCreator;