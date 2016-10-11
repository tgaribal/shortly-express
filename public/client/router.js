Shortly.Router = Backbone.Router.extend({
  initialize: function(options) {
    this.$el = options.el;
  },

  routes: {
    '': 'index',
    'create': 'create',
    'signup': 'signup',
    'login': 'login',
    'logout': 'logout'
  },

  swapView: function(view) {
    this.$el.html(view.render().el);
  },

  index: function() {
    var links = new Shortly.Links();
    var linksView = new Shortly.LinksView({ collection: links });
    this.swapView(linksView);
  },

  create: function() {
    this.swapView(new Shortly.createLinkView());
  },

  signup: function() {
    this.swapView(new Shortly.SignUpView());
  },

  login: function() {
    this.swapView(new Shortly.LoginView());
  },

  logout: function() {
    this.swapView(new Shortly.LoginView());
  }
});
