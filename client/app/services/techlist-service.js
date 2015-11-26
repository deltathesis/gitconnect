angular.module('myApp.techlistService', [])

.service('techList', function() {
  this.techList = [
    'JavaScript', 'AngularJS', 'Sass', 'CSS', 'HTML', 'Firebase',
    'Ruby', 'Less', 'Scala', 'Python', 'C++', 'Swift', 'Objective-C',
    'mongoDB', 'Neo4j', 'MySQL', 'SQLite', 'Shell', 'Redis', 'Meteor',
    'jQuery', 'Java', 'Rails', 'React', 'PHP', 'PostgreSQL', 'Node.js',
    'Express', 'Stylus', 'Symfony', 'Wordpress', 'Zend', 'socket.io',
    'Backbone', 'Boostrap', 'Foundation', 'CoffeeScript', 'Bower', 'Django',
    'ActionScript', 'Ember', 'Go', 'Gulp', 'Grunt', 'Laravel', 'Docker'
  ];

  this.getTechList = function() {
        return this.techList;
  };
})

;