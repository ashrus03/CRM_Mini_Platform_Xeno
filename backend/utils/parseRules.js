const parseRulesToMongoQuery = async (rules, logic) => {
  const map = {
    ">": "$gt",
    "<": "$lt",
    ">=": "$gte",
    "<=": "$lte",
    "==": "$eq",
    "!=": "$ne",
  };
  const conditions = rules.map(({ metric, operator, value }) => {
    let parsedValue =
      metric === "lastPurchased" ? new Date(value) : Number(value);
    return {
      [metric]: { [map[operator]]: parsedValue },
    };
  });

  return logic === "OR" ? { $or: conditions } : { $and: conditions };
};
export default parseRulesToMongoQuery;
