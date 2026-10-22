import { useState } from 'react';
import { taskApi } from '../services/taskApi';
import { getErrorMessage, validateTaskForm } from '../utils/validators';

const emptyForm = {
  team_id: '',
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  assignee_id: '',
};

export function useTaskEditor({ defaultTeamId = '', onChanged }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const close = () => {
    setIsOpen(false);
    setEditingTask(null);
    setFormData(emptyForm);
    setFormError('');
  };

  const openCreate = () => {
    setEditingTask(null);
    setFormData({ ...emptyForm, team_id: defaultTeamId ? String(defaultTeamId) : '' });
    setFormError('');
    setIsOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      team_id: String(task.team_id),
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.due_date || '',
      assignee_id: task.assignee_id ? String(task.assignee_id) : '',
    });
    setFormError('');
    setIsOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();

    const validationError = validateTaskForm(formData);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date || null,
      assignee_id: formData.assignee_id ? Number(formData.assignee_id) : null,
    };

    try {
      setIsSubmitting(true);
      setFormError('');

      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
      } else {
        await taskApi.create({ ...payload, team_id: Number(formData.team_id) });
      }

      close();
      await onChanged?.();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Failed to save the task.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (task) => {
    setActionError('');
    setTaskToDelete(task);
  };

  const cancelDelete = () => setTaskToDelete(null);

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await taskApi.delete(taskToDelete.id);
      setTaskToDelete(null);
      await onChanged?.();
    } catch (error) {
      setTaskToDelete(null);
      setActionError(getErrorMessage(error, 'Failed to delete the task.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    openCreate,
    openEdit,
    requestDelete,
    actionError,
    clearActionError: () => setActionError(''),
    modalProps: {
      isOpen,
      onClose: close,
      onSubmit: submit,
      formData,
      setFormData,
      isEditing: Boolean(editingTask),
      isSubmitting,
      error: formError,
    },
    confirmProps: {
      isOpen: Boolean(taskToDelete),
      title: 'Delete task?',
      message: taskToDelete ? `"${taskToDelete.title}" will be permanently deleted.` : '',
      isBusy: isDeleting,
      onConfirm: confirmDelete,
      onCancel: cancelDelete,
    },
  };
}
