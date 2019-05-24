const User = require('../models/user');
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports = (router) => {


  router.post('/newBlog', (req, res) => {
    if (!req.body.title) {
      res.json({
        success: false,
        message: 'Titre requis.'
      });
    } else {
      if (!req.body.body) {
        res.json({
          success: false,
          message: 'Contenu requis.'
        });
      } else {
        if (!req.body.createdBy) {
          res.json({
            success: false,
            message: 'Auteur requis.'
          });
        } else {
          const blog = new Blog({
            title: req.body.title,
            body: req.body.body,
            createdBy: req.body.createdBy
          });
          blog.save((err) => {
            if (err) {
              if (err.errors) {
                if (err.errors.title) {
                  res.json({
                    success: false,
                    message: err.errors.title.message
                  });
                } else {
                  if (err.errors.body) {
                    res.json({
                      success: false,
                      message: err.errors.body.message
                    });
                  } else {
                    res.json({
                      success: false,
                      message: err
                    });
                  }
                }
              } else {
                res.json({
                  success: false,
                  message: err
                });
              }
            } else {
              res.json({
                success: true,
                message: 'Article enregistré !'
              });
            }
          });
        }
      }
    }
  });

  router.get('/allBlogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
      if (err) {
        res.json({
          success: false,
          message: err
        });
      } else if (!blogs) {
        res.json({
          success: false,
          message: 'Pas d\'articles trouvés.'
        })
      } else {
        res.json({
          success: true,
          blogs: blogs
        });
      }
    }).sort({
      '_id': -1
    });
  });

  router.get('/singleBlog/:id', (req, res) => {
    if (!req.params.id) {
      res.json({
        success: false,
        message: 'Pas d\'id de d\'article renseigné'
      });
    } else {
      Blog.findOne({
        _id: req.params.id
      }, (err, blog) => {
        if (err) {
          res.json({
            success: false,
            message: 'Id d\'article incorrect'
          });
        } else if (!blog) {
          res.json({
            success: false,
            message: 'Pas d\'article trouvé'
          });
        } else {
          User.findOne({
            _id: req.decoded.userId
          }, (err, user) => {
            if (err) {
              res.json({
                success: false,
                message: err
              });
            } else if (!user) {
              res.json({
                success: false,
                message: 'Impossible d\'identifier l\'utilisateur'
              });
            } else if (user.username !== blog.createdBy) {
              res.json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à modifier cet article'
              });
            } else {
              res.json({
                success: true,
                blog: blog
              });
            }
          });
        }
      });
    }
  });

  router.put('/updateBlog', (req, res) => {
    if (!req.body._id) {
      res.json({
        success: false,
        message: 'Pas d\'id renseigné'
      });
    } else {
      Blog.findOne({
        _id: req.body._id
      }, (err, blog) => {
        if (err) {
          res.json({
            success: false,
            message: 'Id invalide'
          });
        } else {
          if (!blog) {
            res.json({
              success: false,
              message: 'Pas d\'article trouvé.'
            });
          } else {
            User.findOne({
              _id: req.decoded.userId
            }, (err, user) => {
              if (err) {
                res.json({
                  success: false,
                  message: err
                });
              } else {
                if (!user) {
                  res.json({
                    success: false,
                    message: 'Impossible de trouver l\'utilisateur'
                  });
                } else {
                  if (user.username !== blog.createdBy) {
                    res.json({
                      success: false,
                      message: 'Vous n\'êtes pas autorisé à modifier cet article'
                    });
                  } else {
                    blog.title = req.body.title;
                    blog.body = req.body.body;
                    blog.save((err) => {
                      if (err) {
                        if (err.errors) {
                          res.json({
                            success: false,
                            message: 'Vérifié que les champs sont bien remplis'
                          });
                        } else {
                          res.json({
                            success: false,
                            message: err
                          });
                        }
                      } else {
                        res.json({
                          success: true,
                          message: 'Article modifié !'
                        });
                      }
                    });
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.delete('/deleteBlog/:id', (req, res) => {
    if (!req.params.id) {
      res.json({
        success: false,
        message: 'Pas d\'id'
      });
    } else {
      Blog.findOne({
        _id: req.params.id
      }, (err, blog) => {
        if (err) {
          res.json({
            success: false,
            message: 'Id invalide'
          });
        } else if (!blog) {
          res.json({
            success: false,
            message: 'Article non trouvé'
          });
        } else {
          User.findOne({
            _id: req.decoded.userId
          }, (err, user) => {
            if (err) {
              res.json({
                success: false,
                message: err
              });
            } else if (!user) {
              res.json({
                success: false,
                message: 'Utilisateur non trouvé'
              });
            } else if (user.username !== blog.createdBy) {
              res.json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à supprimer cet article'
              });
            } else {
              blog.remove((err) => {
                if (err) {
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  res.json({
                    success: true,
                    message: 'Article supprimé !'
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  router.put('/favBlog', (req, res) => {
    if (!req.body.id) {
      res.json({
        success: false,
        message: 'Pas d\'id renseigné'
      });
    } else {
      Blog.findOne({
        _id: req.body.id
      }, (err, blog) => {
        if (err) {
          res.json({
            success: false,
            message: 'Id invalide'
          });
        } else if (!blog) {
          res.json({
            success: false,
            message: 'Article non trouvé'
          });
        } else {
          User.findOne({
            _id: req.decoded.userId
          }, (err, user) => {
            if (err) {
              res.json({
                success: false,
                message: 'Quelque chose s\'est mal passé'
              });
            } else if (!user) {
              res.json({
                success: false,
                message: 'Impossible de trouver l\'utilisateur'
              });
            } else if (user.username === blog.createdBy) {
              res.json({
                success: false,
                message: 'Vous ne pouvez pas mettre en favoris votre propre article'
              });
            } else if (blog.favoris.includes(user.username)) {
              res.json({
                success: false,
                message: 'Vous avez déjà mis en favoris cet article'
              });
            } else {
              blog.favoris.push(user.username);
              blog.save((err) => {
                if (err) {
                  res.json({
                    success: false,
                    message: 'Quelque chose s\'est mal passé'
                  });
                } else {
                  res.json({
                    success: true,
                    message: 'Article mis en favoris'
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  router.post('/comment', (req, res) => {
    if (!req.body.comment) {
      res.json({
        success: false,
        message: 'Pas de commentaire rempli'
      });
    } else if (!req.body.id) {
      res.json({
        success: false,
        message: 'Pas d\'id renseigné'
      });
    } else {
      Blog.findOne({
        _id: req.body.id
      }, (err, blog) => {
        if (err) {
          res.json({
            success: false,
            message: 'Id d\'article invalide'
          });
        } else if (!blog) {
          res.json({
            success: false,
            message: 'Article non trouvé'
          });
        } else {
          User.findOne({
            _id: req.decoded.userId
          }, (err, user) => {
            if (err) {
              res.json({
                sucess: false,
                message: 'Quelque chose ne s\'est ma passé'
              });
            } else if (!user) {
              res.json({
                sucess: false,
                message: 'Utilisateur non trouvé'
              });
            } else {
              blog.comments.push({
                comment: req.body.comment,
                commentator: user.username
              });
              blog.save((err) => {
                if (err) {
                  res.json({
                    success: false,
                    message: 'Quelque chose ne s\'est ma passé'
                  });
                } else {
                  res.json({
                    success: true,
                    message: 'Commentaire ajouté'
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  return router;
};