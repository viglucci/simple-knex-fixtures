const config = require("../config.js");
const gulp = require("gulp");
const mocha = require("gulp-mocha");
const istanbul = require("gulp-istanbul");
const run = require("run-sequence");

gulp.task("test", (done) => {
    run("pre-test", "run-test", done);
});

gulp.task("pre-test", () => {
    return gulp.src(config.test.src)
    // Covering files
    .pipe(istanbulgit({
        includeUntested: true
    }))
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task("run-test", () => {
    return gulp.src(config.test.tests)
    .pipe(mocha({ timeout: 5000 }))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});
