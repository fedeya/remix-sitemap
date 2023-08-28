import { getFullPath } from '../data';

describe('getFullPath', () => {
  test('should return just the path if parentId is root', () => {
    const path = getFullPath('admin.users.$id', {
      root: {
        path: ''
      },
      'admin.users.$id': {
        parentId: 'root',
        path: 'admin/users/:id'
      }
    });

    expect(path).toBe('admin/users/:id');
  });

  test('should return the full path of a route with multiple parents', () => {
    const path = getFullPath('blog.post.$id', {
      root: {
        path: ''
      },
      blog: {
        parentId: 'root',
        path: 'blog'
      },
      'blog.post': {
        parentId: 'blog',
        path: 'post'
      },
      'blog.post.$id': {
        parentId: 'blog.post',
        path: ':id'
      }
    });

    expect(path).toBe('blog/post/:id');
  });
});
