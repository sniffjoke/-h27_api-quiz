export class PaginationBaseModel<T> {
    public readonly pageSize: number
    public readonly pagesCount: number
    public readonly totalCount: number
    public readonly page: number
    public readonly items: T[]

    constructor(queryModel: any, items: any) {
        this.pageSize = queryModel.pageSize;
        this.pagesCount = queryModel.pagesCount;
        this.totalCount = queryModel.totalCount;
        this.page = queryModel.page;
        this.items = items;
    }
}
