import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Drawer,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Switch,
  Fab,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  fetchTodos,
  fetchTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  setFilters,
  clearSelectedTodo,
  clearError,
} from './features/todos/todosSlice';
import type { CreateTodoRequest, UpdateTodoRequest, Todo } from './types/todo.types';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  
  // Redux state
  const { items, meta, filters, loading, error, selectedTodo } = useAppSelector(
    (state) => state.todos
  );

  // Local state
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_completed: false,
  });

  // Filter data
  const [filterData, setFilterData] = useState({
    title: '',
    description: '',
    is_completed: '',
  });

  // Fetch todos on mount and when filters change
  useEffect(() => {
    dispatch(fetchTodos(filters));
  }, [dispatch, filters]);

  const handleOpenForm = (todo: Todo | null = null) => {
    if (todo) {
      setEditingTodo(todo);
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        start_date: todo.start_date ? todo.start_date.split('T')[0] : '',
        end_date: todo.end_date ? todo.end_date.split('T')[0] : '',
        is_completed: todo.is_completed || false,
      });
    } else {
      setEditingTodo(null);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        is_completed: false,
      });
    }
    setOpenForm(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingTodo(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate
      if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
        console.error('Validation failed:', formData);
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error',
        });
        return;
      }

      const submitData: CreateTodoRequest = {
        title: formData.title,
        description: formData.description,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      console.log('Submitting data:', submitData);

      if (editingTodo) {
        const result = await dispatch(
          updateTodo({
            id: editingTodo._id,
            data: { ...submitData, is_completed: formData.is_completed },
          })
        ).unwrap();
        console.log('Update result:', result);
        if (openDetails && selectedTodo?._id === editingTodo._id) {
          await dispatch(fetchTodoById(editingTodo._id));
        }
        setSnackbar({
          open: true,
          message: 'Todo updated successfully',
          severity: 'success',
        });
      } else {
        const result = await dispatch(createTodo(submitData)).unwrap();
        console.log('Create result:', result);
        setSnackbar({
          open: true,
          message: 'Todo created successfully',
          severity: 'success',
        });
      }
      
      handleCloseForm();
      dispatch(fetchTodos(filters));
    } catch (err) {
      console.error('Submit error:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Operation failed',
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await dispatch(deleteTodo(id)).unwrap();
        setSnackbar({
          open: true,
          message: 'Todo deleted successfully',
          severity: 'success',
        });
        dispatch(fetchTodos(filters));
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Delete failed',
          severity: 'error',
        });
      }
    }
  };

  // Handle view details
  const handleViewDetails = async (id: string) => {
    await dispatch(fetchTodoById(id));
    setOpenDetails(true);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    const newFilters: any = { ...filters, page: 1 };
    
    if (filterData.title) newFilters.title = filterData.title;
    if (filterData.description) newFilters.description = filterData.description;
    if (filterData.is_completed !== '') {
      newFilters.is_completed = filterData.is_completed === 'true';
    }

    dispatch(setFilters(newFilters));
    setOpenFilters(false);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilterData({
      title: '',
      description: '',
      is_completed: '',
    });
    dispatch(
      setFilters({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
        title: undefined,
        description: undefined,
        is_completed: undefined,
      })
    );
    setOpenFilters(false);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f7fa',
      pb: isMobile ? 10 : 4,
      fontFamily: 'Inter, sans-serif !important',
    '& *': {
      fontFamily: 'Inter, sans-serif !important'
    }
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header */}
        <Box sx={{ 
          mb: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}>
          <Typography variant="h4" component="h1" className="font-bold" sx={{ 
             textAlign: { xs: 'center', sm: 'left' } }}>
          📝 Todo Management
        </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5,
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setOpenFilters(true)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                flex: { xs: 1, sm: 'initial' }
              }}
            >
              Filters
            </Button>
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                }}
              >
                New Todo
              </Button>
            )}
          </Box>
        </Box>

        {/* Sorting Controls */}
        <Box sx={{ 
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: { xs: 'center', sm: 'flex-start' }
        }}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sort || 'createdAt'}
              label="Sort By"
              onChange={(e) => dispatch(setFilters({ sort: e.target.value as any }))}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="start_date">Start Date</MenuItem>
              <MenuItem value="end_date">End Date</MenuItem>
              <MenuItem value="is_completed">Status</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '48%', sm: 120 } }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.order || 'desc'}
              label="Order"
              onChange={(e) => dispatch(setFilters({ order: e.target.value as any }))}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '48%', sm: 120 } }}>
            <InputLabel>Per Page</InputLabel>
            <Select
              value={filters.limit || 10}
              label="Per Page"
              onChange={(e) => dispatch(setFilters({ limit: Number(e.target.value), page: 1 }))}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={50} />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }} 
            onClose={() => dispatch(clearError())}
          >
            {error}
          </Alert>
        )}

        {/* Todo List */}
        {!loading && (
          <Grid 
            container 
            spacing={{ xs: 2, sm: 2, md: 2.5 }}
            justifyContent= {{ xs: 'center', sm: 'left' }}
          >
            {items.map((todo) => (
              <Grid 
                item 
                xs={6}
                sm={6}
                md={2.4}
                key={todo._id}
                sx={{ display: 'flex' }}
              >
                <Card sx={{ 
                  width: { xs: '150px', sm: '140px', md: '270px' },
                  height: { xs: '250px', sm: '300px', md: '220px' },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}>
                  <CardContent sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 0.225,
                      gap: 0.5,
                      minHeight: '2.6em'
                    }}>
                      <Typography
                        variant="h6"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.95rem', sm: '1.1rem' },
                          flex: 1,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {todo.title}
                      </Typography>
                      <Chip
                        label={todo.is_completed ? 'Done' : 'Pending'}
                        color={todo.is_completed ? 'success' : 'warning'}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 },
                          flexShrink: 0
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 0.625,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.5,
                        height: '3em',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}
                    >
                      {todo.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          display: 'block',
                          mb: 0.5,
                          fontSize: { xs: '0.7rem', sm: '0.8rem' }
                        }}
                      >
                        📅 Start: {new Date(todo.start_date).toLocaleDateString()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          display: 'block',
                          fontSize: { xs: '0.7rem', sm: '0.8rem' }
                        }}
                      >
                        📅 End: {new Date(todo.end_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.5,
                      pt: 1,
                      mt: 'auto',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      justifyContent: { xs: 'space-around', sm: 'flex-start' }
                    }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(todo._id)}
                        title="View Details"
                        sx={{ 
                          padding: { xs: '4px', sm: '8px' },
                          '&:hover': { 
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        <ViewIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenForm(todo)}
                        title="Edit"
                        sx={{ 
                          padding: { xs: '4px', sm: '8px' },
                          '&:hover': { 
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        <EditIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(todo._id)}
                        title="Delete"
                        sx={{ 
                          padding: { xs: '4px', sm: '8px' },
                          '&:hover': { 
                            bgcolor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 12,
            px: 2
          }}>
            <Box sx={{ 
              fontSize: '4rem',
              mb: 2,
              opacity: 0.5
            }}>
              📝
            </Box>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 1, fontWeight: 600 }}
            >
              No todos found
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 3 }}
            >
              Create your first todo to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              size="large"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}
            >
              Create Your First Todo
            </Button>
          </Box>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4
          }}>
            <Pagination
              count={meta.totalPages}
              page={meta.page}
              onChange={(e, page) => dispatch(setFilters({ page }))}
              color="primary"
              showFirstButton
              showLastButton
              size={isMobile ? 'small' : 'medium'}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        )}

        {/* Floating Action Button (Mobile) */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{ 
              position: 'fixed', 
              bottom: 24, 
              right: 24,
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)'
            }}
            onClick={() => handleOpenForm()}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Create/Edit Form Dialog */}
        <Dialog 
          open={openForm} 
          onClose={handleCloseForm} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {editingTodo ? 'Edit Todo' : 'Create New Todo'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              {editingTodo && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_completed}
                      onChange={(e) =>
                        setFormData({ ...formData, is_completed: e.target.checked })
                      }
                    />
                  }
                  label="Mark as Completed"
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleCloseForm}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              {editingTodo ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Details Dialog */}
        <Dialog
          open={openDetails}
          onClose={() => {
            setOpenDetails(false);
            dispatch(clearSelectedTodo());
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          {selectedTodo && (
            <>
              <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontWeight: 600
              }}>
                <span>Todo Details</span>
                <IconButton
                  onClick={() => {
                    setOpenDetails(false);
                    dispatch(clearSelectedTodo());
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={0.625}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Title
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedTodo.title}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography variant="body1">{selectedTodo.description}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={selectedTodo.is_completed ? 'Completed' : 'Pending'}
                      color={selectedTodo.is_completed ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedTodo.start_date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedTodo.end_date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedTodo.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Updated At
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedTodo.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                  onClick={() => handleOpenForm(selectedTodo)} 
                  startIcon={<EditIcon />}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(selectedTodo._id);
                    setOpenDetails(false);
                  }}
                  color="error"
                  startIcon={<DeleteIcon />}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Delete
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Filters Drawer */}
<Drawer
  anchor="right"
  open={openFilters}
  onClose={() => setOpenFilters(false)}
  PaperProps={{
    sx: {
      width: 300
    }
  }}
>
  <Box sx={{ 
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
  }}>
    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
      Filters
    </Typography>
    
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      <Stack spacing={2.5}>
        <TextField
          label="Search by Title"
          fullWidth
          value={filterData.title}
          onChange={(e) => setFilterData({ ...filterData, title: e.target.value })}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <TextField
          label="Search by Description"
          fullWidth
          value={filterData.description}
          onChange={(e) => setFilterData({ ...filterData, description: e.target.value })}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterData.is_completed}
            label="Status"
            onChange={(e) =>
              setFilterData({ ...filterData, is_completed: e.target.value })
            }
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="false">Pending</MenuItem>
            <MenuItem value="true">Completed</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>

    <Box sx={{ display: 'flex', gap: 1.5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
      <Button 
        variant="outlined" 
        fullWidth 
        onClick={handleClearFilters}
        sx={{ 
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 600
        }}
      >
        Clear
      </Button>
      <Button 
        variant="contained" 
        fullWidth 
        onClick={handleApplyFilters}
        sx={{ 
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 600
        }}
      >
        Apply
      </Button>
    </Box>
  </Box>
</Drawer> 
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default App;