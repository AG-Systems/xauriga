(function () {
    var Blog = function(header, author, team, date, paragraphs, imgLinks, index) {
        this.header = header;
        this.author = author;
        this.team   = team;
        this.date   = date; 
        this.paragraphs = paragraphs;
        this.images  = imgLinks;
        this.index  = index;
    }

    Blog.prototype.getDatePlain = function() {
        var monthNames = [
            "January", "February", "March", "April", "May", "June"
          , "July", "August", "September", "October", "November", "December"
        ];

        var month = monthNames[this.date.getMonth()]
        var day   = this.date.getDate();
        var year  = this.date.getFullYear();

        return month + " " + day + ", " + year;
    }

    //base info everyone has, including mentors. using composition
    var Participant = function(firstname, lastname, portrait) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.portrait = portrait;
    }
    Participant.prototype.getFirstName = function() { return this.firstname; }
    Participant.prototype.getLastName  = function() { return this.lastname;  }
    Participant.prototype.getPortrait  = function() { return this.portrait;  }
    Participant.prototype.getFullName  = function() { 
        return this.getFirstName() + " " + this.getLastName();
    }

    //students of the team
    var Member = function(firstname, lastname, portrait, grade) {
        this.participant = new Participant(firstname, lastname, portrait);
        this.grade = grade;
    }
    Member.prototype.getFirstName = function() { return this.participant.getFirstName(); }
    Member.prototype.getLastName  = function() { return this.participant.getLastName();  }
    Member.prototype.getPortrait  = function() { return this.participant.getPortrait();  }
    Member.prototype.getGrade     = function() { return this.grade;                      }
    Member.prototype.getFullName  = function() { return this.participant.getFullName();  }

    //leads of the team
    var Lead = function(firstname, lastname, portrait, grade, title) {
        this.member = new Member(firstname, lastname, portrait, grade);
        this.title = title;
    }
    Lead.prototype.getFirstName = function() { return this.member.getFirstName(); }
    Lead.prototype.getLastName  = function() { return this.member.getLastName();  }
    Lead.prototype.getPortrait  = function() { return this.member.getPortrait();  }
    Lead.prototype.getGrade     = function() { return this.member.getGrade();     }
    Lead.prototype.getTitle     = function() { return this.title;                 }
    Lead.prototype.getFullName  = function() { return this.member.getFullName();  }


    var sortLastName = function (left, right) {
        return left.getLastName().localeCompare(right.getLastName());
    }
    
    var module = angular.module("ironBlog", ['ngRoute', 'ngSanitize']);

    /* Navigation bar routing. */
    module.config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $locationProvider.hashPrefix('!');
            $routeProvider.
                when('/', {
                    templateUrl: 'pages/blog.html'

                }).
                when('/posts/:blogId', {
                    templateUrl: 'pages/blog-post.html',
                    controller: 'BlogDetailCtrl'
                }).
                when('/roster', {
                    templateUrl: 'pages/roster-table.html',
                    controller: 'BlogController'
                }).
                when('/contact', {
                    templateUrl: 'pages/contact.html'
                }).
                when('/eblog', {
                    templateUrl: 'pages/eblog.html'
                }).
                when('/resources', {
                    templateUrl: 'pages/resources.html'
                }).
                when('/about', {
                    templateUrl: 'pages/about.html'
                }).
                when('/sponsors', {
                    templateUrl: 'pages/sponsors.html'
                }).
                when('/publicity', {
                    templateUrl: 'pages/publicity.html'
                }).
                otherwise({
                    redirectTo: '/'
                });
        }
    ]);

    module.service('ParseJSONService', function($http, $q) {
        this.getParsedJSON = function() {
            var deferred = $q.defer();

            $http.get("text-content/blogs.json").success(function (data, status) {
                deferred.resolve(data);
            }).error(function(data, status) {
                deferred.reject(data);
            });

            return deferred.promise;
        }
    });
    
    module.controller("BlogController"
        , function($scope, ParseJSONService) {
            $scope.blogs = [];
            $scope.mentors = [];
            $scope.leads = [];
            $scope.engineers = [];
            $scope.programmers = [];
            $scope.business = [];

            ParseJSONService.getParsedJSON().then(function (data) {
                var parsedJSON = data;

                var j = 0;
                for (var i = parsedJSON.blogs.length - 1; i >= 0; i--) {
                    var blog = parsedJSON.blogs[i];
                    $scope.blogs.push(new Blog(
                            blog.header
                          , blog.author
                          , blog.team
                          , new Date(blog.date[0], blog.date[1] - 1, blog.date[2])
                          , blog.paragraphs
                          , blog.images
                          , j++ //need to fix this logic, cannot permalink to a blog
                        )
                    );
                }

                //roster table
                var mentors = parsedJSON.members.mentors;
                for (var i = 0; i < mentors.length; i++) {
                    var mentor = mentors[i];
                    $scope.mentors.push(new Participant(
                            mentor.firstname,
                            mentor.lastname,
                            mentor.portrait
                        )
                    );
                }
                $scope.mentors.sort(sortLastName);

                var leads = parsedJSON.members.leads;
                for (var i = 0; i < leads.length; i++) {
                    var lead = leads[i];
                    $scope.leads.push(new Lead(
                            lead.firstname,
                            lead.lastname,
                            lead.portrait,
                            lead.grade,
                            lead.title
                        )
                    );
                }
                $scope.leads.sort(function (left, right) {
                    if (left.title === right.title)
                        return sortLastName(left, right);

                    return false;
                });

                var engineers = parsedJSON.members.engineers;
                for (var i = 0; i < engineers.length; i++) {
                    var engineer = engineers[i];
                    $scope.engineers.push(new Member(
                            engineer.firstname,
                            engineer.lastname,
                            engineer.portrait,
                            engineer.grade
                        )
                    );
                }
                $scope.engineers.sort(sortLastName);

                var programmers = parsedJSON.members.programmers;
                for (var i = 0; i < programmers.length; i++) {
                    var programmer = programmers[i];
                    $scope.programmers.push(new Member(
                            programmer.firstname,
                            programmer.lastname,
                            programmer.portrait,
                            programmer.grade
                        )
                    );
                }
                $scope.programmers.sort(sortLastName);

                var business = parsedJSON.members.business;
                for (var i = 0; i < business.length; i++) {
                    var busi = business[i];
                    $scope.business.push(new Member(
                            busi.firstname,
                            busi.lastname,
                            busi.portrait,
                            busi.grade
                        )
                    );
                }
                $scope.business.sort(sortLastName);

                //pagination
                $scope.maxBlogs = 5;
                $scope.currentPage = 0;
                $scope.numPages = function () {
                    return Math.ceil($scope.blogs.length / $scope.maxBlogs);
                }

                $scope.isMostRecent = function (index) {
                    return index === 0;  //this logic needs to be fixed, as well as in the for loop where Blog is constructed
                    //the most recent index should be the last index (blogs.length - 1)
                    //so we can permalink blogs
                }

                $scope.limitText = function(index) {
                    return $scope.isMostRecent(index) ? 400 : 200; 
                }
            });
        }
    );

    /* Makes the index of the clicked blog accessible so that the appropriate post is displayed. */
    module.controller("BlogDetailCtrl", ['$scope', '$routeParams',function($scope, $routeParams) {
        $scope.blog_id = $routeParams.blogId;
    }]);


    module.directive("isoTime", function() {
        return {
            link: function (scope, element, attrs) {
                var time = attrs.myIsoTime;
                attrs.$set('timedate', time);
            }
        }
    });

    //pagination
    module.filter("startFrom", function () {
        return function (input, start) {
            start = +start; //parse to int
            return input.slice(start);
        }
    });

    module.run(["$rootScope", "$window", "$location", "$anchorScroll"
        , function ($rootScope, $window, $location, $anchorScroll) {
            $rootScope.$on("$routeChangeStart"
                , function (evt, absNewUrl, absOldUrl) {
                    var expandPost = "/posts/";
                    if ($location.path().match(expandPost) !== null) {
                        /*$location.hash("topOfBlog");
                        $anchorScroll();*/
                        $window.scrollTo(0, 301);   //ugly
                    } else {
                        $window.scrollTo(0, 0);
                    }
                }
            );
        }
    ]);
})();

function randomizeImage() {
    var bannerMin = 0;
    var bannerMax = 2;
    var img = Math.floor(Math.random() * (bannerMax - bannerMin + 1)) + bannerMin;
    var header = document.body.children[0];
    var path = "imgs/banners/banner" + img + ".jpg";
    header.style.backgroundImage = "url('" + path + "')";
}