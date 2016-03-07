d3.layout.fruchtermanReingold = function() {
    var force = {},
        event = d3.dispatch("start", "tick", "end"),
        autoArea = true,
        area,
        gravity = 0.1,
        speed = 0.1,
        nodes = [],
        links = [],
        iterations = 1000,
        iterCount = 0;

    force.tick = function() {
        if (iterCount <= 0) {
            timer = null;
            event.end({
                type: "end",
                iterCount: iterCount = 0
            });
            return true;
        }

        var i,
            j,
            n,
            n2,
            e,
            xDist,
            yDist,
            dist,
            repulsiveF,
            nodesCount = nodes.length,
            edgesCount = links.length;

        area = autoArea ? (nodesCount * nodesCount) : area;
        var maxDisplace = Math.sqrt(area) / 10,
            k = Math.sqrt(area / (1 + nodesCount));

        for (i = 0; i < nodesCount; i++) {
            n = nodes[i];

            // Init
            if (!n.fr) {
                n.fr_x = n.x;
                n.fr_y = n.y;
                n.fr = {
                    dx: 0,
                    dy: 0
                };
            }

            for (j = 0; j < nodesCount; j++) {
                n2 = nodes[j];

                // Repulsion force
                if (n.id != n2.id) {
                    xDist = n.fr_x - n2.fr_x;
                    yDist = n.fr_y - n2.fr_y;
                    dist = Math.sqrt(xDist * xDist + yDist * yDist) + 0.01;
                    // var dist = Math.sqrt(xDist * xDist + yDist * yDist) - n1.size - n2.size;

                    if (dist > 0) {
                        repulsiveF = k * k / dist;
                        n.fr.dx += xDist / dist * repulsiveF;
                        n.fr.dy += yDist / dist * repulsiveF;
                    }
                }
            }
        }

        var nSource,
            nTarget,
            attractiveF;

        for (i = 0; i < edgesCount; i++) {
            e = links[i];

            // Attraction force
            nSource = e.source;
            nTarget = e.target;

            xDist = nSource.fr_x - nTarget.fr_x;
            yDist = nSource.fr_y - nTarget.fr_y;
            dist = Math.sqrt(xDist * xDist + yDist * yDist) + 0.01;
            // dist = Math.sqrt(xDist * xDist + yDist * yDist) - nSource.size - nTarget.size;
            attractiveF = dist * dist / k;

            if (dist > 0) {
                nSource.fr.dx -= xDist / dist * attractiveF;
                nSource.fr.dy -= yDist / dist * attractiveF;
                nTarget.fr.dx += xDist / dist * attractiveF;
                nTarget.fr.dy += yDist / dist * attractiveF;
            }
        }

        var d,
            gf,
            limitedDist;

        for (i = 0; i < nodesCount; i++) {
            n = nodes[i];

            // Gravity
            d = Math.sqrt(n.fr_x * n.fr_x + n.fr_y * n.fr_y);
            gf = 0.01 * k * gravity * d;
            n.fr.dx -= gf * n.fr_x / d;
            n.fr.dy -= gf * n.fr_y / d;

            // Speed
            n.fr.dx *= speed;
            n.fr.dy *= speed;

            // Apply computed displacement
            if (!n.fixed) {
                xDist = n.fr.dx;
                yDist = n.fr.dy;
                dist = Math.sqrt(xDist * xDist + yDist * yDist);

                if (dist > 0) {
                    limitedDist = Math.min(maxDisplace * speed, dist);
                    n.fr_x += xDist / dist * limitedDist;
                    n.fr_y += yDist / dist * limitedDist;
                }
            }
        }

        for (var i = 0; i < nodes.length; i++) {
          nodes[i].x = nodes[i].fr_x;
          nodes[i].y = nodes[i].fr_y;
        }

        iterCount--;

        event.tick({
            type: "tick",
            iterCount: iterCount,
        });
    };

    force.nodes = function(x) {
        if (!arguments.length) return nodes;
        nodes = x;
        return force;
    };

    force.links = function(x) {
        if (!arguments.length) return links;
        links = x;
        return force;
    };

    force.autoArea = function(x) {
        if (!arguments.length) return autoArea;
        autoArea = x;
        return force;
    };

    force.area = function(x) {
        if (!arguments.length) return area;
        area = x;
        return force;
    };

    force.speed = function(x) {
        if (!arguments.length) return speed;
        speed = x;
        return force;
    };

    force.iterations = function(x) {
        if (!arguments.length) return iterations;

        iterations = x;
        event.start({
            type: "start",
            iterCount: iterCount,
        });
        timer = d3.timer(force.tick);

        return force;
    };

    force.gravity = function(x) {
        if (!arguments.length) return gravity;
        gravity = x;
        return force;
    };

    force.start = function() {
        iterCount = iterations;

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].fr_x = nodes[i].x;
            nodes[i].fr_y = nodes[i].y;
            nodes[i].fr = {
                dx: 0,
                dy: 0
            };
        }

        return force.resume();
    };

    force.resume = function() {
        return force.iterations(iterations);
    };

    force.stop = function() {
        return force.iterations(0);
    };

    return d3.rebind(force, event, "on");
};
