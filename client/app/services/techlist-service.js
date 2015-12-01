angular.module('myApp.techlistService', [])

.service('techList', function() {
  this.techList = [
  'AWS', 'ActionScript', 'AngularJS', 'Backbone', 'Bison',
  'Bootstrap', 'Bower', 'C', 'C#', 'C++', 'CSS',
  'CoffeeScript', 'Dart', 'Django', 'Docker', 'Drupal',
  'Ember', 'Express', 'Facebook-API', 'Firebase',
  'Foundation', 'Github-API', 'Go', 'Google-API', 'Grunt',
  'Gulp', 'HTML', 'Heroku', 'Ionic', 'Java', 'JavaScript',
  'Laravel', 'Less', 'LinkedIn-API', 'Meteor', 'MySQL',
  'Neo4j', 'Node.js', 'Objective-C', 'PHP', 'PostgreSQL',
  'PowerShell', 'Puppet', 'Python', 'Rails', 'React',
  'Redis', 'Ruby', 'Rust', 'SQLite', 'Sass', 'Scala',
  'Shell', 'Stylus', 'Swift', 'Symfony', 'Wordpress',
  'Zend', 'jQuery', 'mongoDB', 'socket.io'
  ];

  this.getTechList = function() {
        return this.techList;
  };
})

;