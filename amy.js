/*globals window*/

var Amy = {

    init: function () {
        //Attach location change watcher
        window.onhashchange = this.on_location_change;

        // Run first route check
        this.on_location_change();
    },

    add: function (url, callback) {
        // Attach new route
        this.routes.push({pattern: url, pattern_regexp: this.pattern_to_regexp(url), callback: callback});
    },

    routes: [],

    run_route: function (location) {
        // Loops through routes and call callback if route is in routes
        var routed = false;
        this.routes.forEach(function (route, index, array) {
            var params = {location: location},
                query_string = location.split("?"),
                group_index = 1,
                pattern_elements, regexp_result;
            if (route.pattern_regexp.test(location)) {
                // Check for capturing groups
                if (route.pattern.indexOf("/:") > -1 || route.pattern.indexOf("#:")) {
                    regexp_result = route.pattern_regexp.exec(location);
                    pattern_elements = route.pattern.split(/\/|#/);
                    pattern_elements.forEach(function (element, index, array) {
                        if (element[0] === ":") {
                            params[element.replace(":", "")] = regexp_result[group_index];
                            group_index += 1;
                        }
                    });
                }
                // Parse query params

                if (query_string.length > 1) {
                    params = Amy.combine_obj(params, Amy.parse_query_string(query_string[1]));
                }
                route.callback(params);
                routed = true;
                return false;
            }
            return true;
        });
        if (!routed) {
            console.log("Page not found");
        }
    },

    pattern_to_regexp: function (pattern) {
        // Convert amy pattern to regexp
        var reg_exp, pattern_elements,
            with_capturing_groups = pattern;
        pattern_elements = pattern.split(/\/|#/);
        pattern_elements.forEach(function (element, index, array) {
            if (element[0] === ":") {
                with_capturing_groups = with_capturing_groups.replace(element, "([\\w]*)");
            }
        });
        reg_exp = with_capturing_groups.split("?")[0].replace("/", "\/");
        return new RegExp(reg_exp, "i");
    },

    on_location_change: function () {
        // Handles location change
        var location = window.location.href.replace(window.location.host, "").replace(window.location.protocol + "//", "");
        Amy.run_route(location);
    },

    parse_query_string: function (query_string) {
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query_params = {};
        while (match = search.exec(query_string)) {
           query_params[decode(match[1])] = decode(match[2]);
        }
        return query_params;
    },

    combine_obj: function (obj1, obj2) {
        var key;
        for (key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
        return obj1;
    }
};