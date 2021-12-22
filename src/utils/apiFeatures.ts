export class APIFeatures {
  query;
  queryString;
  queryType;
  currentUser;
  queryFilters = {};

  constructor(
    currentUser: any,
    query: any,
    queryString: any,
    queryType: any = "find"
  ) {
    this.currentUser = currentUser;
    this.query = query;
    this.queryString = queryString;
    this.queryType = queryType;
  }

  filter() {
    // 1) General filtering
    let queryObj = { ...this.queryString, is_deleted: false };
    let excludedFields = ["skip", "sort", "limit", "fields", "noPagination"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2) (GT - GTE) / (LT - LTE)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryStr);

    // 3) Advanced filtering (Not Equals / Like)
    if (queryObj.filters && queryObj.filters) {
      const advancedFilters = [...JSON.parse(queryObj.filters)];
      advancedFilters.forEach((el) => {
        if (el.operator === "not_equals") {
          queryObj[el.key] = { $ne: el.value };
        } else if (el.operator === "like") {
          const tempSplit = el.key.split(",");
          const $or: any = [];
          tempSplit.forEach((key: any) =>
            $or.push({ [key]: { $regex: ".*" + el.value + ".*" } })
          );
          queryObj["$or"] = $or;
        } else {
          queryObj[el.key] = el.value;
        }
      });
      delete queryObj["filters"];
    }

    // 4) Date Range Filtering
    if (queryObj.dateRange) {
      const dateRange = { ...JSON.parse(queryObj.dateRange) };
      const { startRange, endRange } = dateRange;

      queryObj["createdAt"] = { $gte: new Date(startRange), $lte: new Date(endRange) };
      delete queryObj["dateRange"];
    }

    // 5) Save Query Filters
    if (this.queryType !== "count") {
      this.queryFilters = queryObj;
      this.query = this.query.find(queryObj);
    } else {
      this.query = this.query.countDocuments(queryObj);
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = JSON.parse(this.queryString.sort);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt -created_at");
    }

    if (this.queryType !== "count") {
      this.queryFilters = { ...this.queryFilters, sortBy: this.queryString.sort || "-createdAt -created_at" };
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    if (this.queryType !== "count" && this.queryString.fields) {
      this.queryFilters = { ...this.queryFilters, fields: this.queryString.fields };
    }

    return this;
  }

  paginate() {
    if (!this.queryString.noPagination) {
      const skip = this.queryString.skip * 1 || 0;
      const limit = this.queryString.limit * 1 || 10;

      this.query = this.query.skip(skip).limit(limit);

      if (this.queryType !== "count") {
        this.queryFilters = { ...this.queryFilters, skip, limit };
      }
    }

    return this;
  }
}