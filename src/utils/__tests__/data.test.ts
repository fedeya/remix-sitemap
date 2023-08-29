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

  test('should return undefined in index route with same name parent', () => {
    const path = getFullPath('blog._index', {
      root: {
        path: ''
      },
      blog: {
        parentId: 'root',
        path: 'blog'
      },
      'blog._index': {
        parentId: 'blog'
      }
    });

    expect(path).toBeUndefined();
  });

  test('should return path in index route without parent', () => {
    const path = getFullPath('blog._index', {
      root: {
        path: ''
      },
      'blog._index': {
        parentId: 'root',
        path: 'blog'
      }
    });

    expect(path).toBe('blog');
  });

  test('should return path with parents in index route', () => {
    const path = getFullPath('admin.content._index', {
      root: {
        path: ''
      },
      admin: {
        parentId: 'root',
        path: 'admin'
      },
      'admin.content._index': {
        parentId: 'admin',
        path: 'content'
      }
    });

    expect(path).toBe('admin/content');
  });
});
