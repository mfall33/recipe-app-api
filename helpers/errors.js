var _ = require('lodash');

const formatErrors = (errors) => {

    return _(errors)
        .groupBy('param')
        .mapValues(group => _.map(group, 'msg'))
        .value()

};

module.exports.formatErrors = formatErrors;