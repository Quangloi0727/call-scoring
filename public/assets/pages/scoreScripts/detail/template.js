const template = `
                <div class="card card-default wp-list-criteria-item">
                    <div class="removeCard">
                        <button type="button" class="btn rounded-circle text-danger rm-criteria" title="Xóa tiêu chí">
                            <i class="fas fa-times" style="font-size: 2rem"></i>
                        </button>
                    </div>
                <div class="card-header">
                    <h4 class="card-title w-100">
                        <div class="row">
                            <div class="col">
                                <div class="form-group row">
                                    <label for="description" class="col-sm-12 col-form-label d-flex">Tiêu chí <span class="text-danger pl-2 pr-2">*</span>
                                        <div class="custom-control custom-switch">
                                            <input type="checkbox" class="custom-control-input cb-is-active" id="customSwitches"/>
                                            <label class="custom-control-label" for="customSwitches" data-toggle="tooltip" data-placement="right" title="Tiêu chí có sử dụng tính điểm không?" role="button"></label>
                                        </div>
                                    </label>
                                <div class="col-sm-12">
                                    <input type="text" class="form-control name-criteria" id="nameCriteria" name="nameCriteria" placeholder="Tên tiêu chí"/>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group row">
                                <label for="description" class="col-sm-12 col-form-label d-flex">Điểm tối đa của tiêu chí <span class="text-danger pl-2 pr-2">*</span></label>
                                <div class="col-sm-11">
                                    <input type="number" class="form-control score-max" id="scoreMax" name="scoreMax" placeholder="Điểm" />
                                </div>
                            </div>
                        </div>
                        </div>
                    </h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <label>Lựa chọn<span class="text-danger">*</span></label>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group">
                                <label>Tính điểm <span class="text-danger">*</span></label>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group text-center">
                                <label>Điểm liệt của nhóm tiêu chí</label>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group text-center">
                                <label>Điểm liệt của kịch bản</label>
                            </div>
                        </div>
                        <div class="col-sm-1 d-flex align-items-center justify-content-end"></div>
                    </div>
                    <div class="row wp-list-selection-criteria" id="tempSelectionCriteria">
                        
                    </div>
                </div>
                <p class="m-0 wp-add-selection-criteria"></p>
                </div>

`

module.exports = {
    template
}