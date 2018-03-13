<template>
  <div class="fee">
    <div class="no-data" v-if="isNoData">
      <el-button type="primary" @click="addFee">新增计费</el-button>
    </div>
    <el-container v-else class="fee-main-cont">
      <el-aside class="fee-aside">
        <ul>
          <li v-for='(item,index) in feeData' :title="item.ruleName" :class="{active:index == num}" 
          @click="tabTitle(index,item)" :key="item.id">{{ item.ruleName }}</li>
        </ul>
      </el-aside>
      <el-main class="fee-main">
        <section class="fee-btns">
          <el-button type="primary" @click="addFee">新增</el-button>
          <el-button type="primary" @click="editSaveFee">保存</el-button>
          <el-button type="danger" @click="deleteFee">删除</el-button>
        </section>
        <section v-if="feeType == 'interval'">
          <h6><span>计费名称:</span><input type="text" v-model = "feeName" :maxlength="50"></h6> 
          <div class="memo-text">
            <span>计费描述:</span><textarea :rows="4" :maxlength="256" v-model = "memo"></textarea>
          </div>
          <p>计费详细</p>
          <table>
            <thead>
              <tr><td>车辆类型</td><td>免费时间</td><td>全天最高收费</td></tr>
            </thead>
            <tbody>
              <tr>
                <td @click="checkCarType" class="check-detail">小车</td>
                <td>
                  <input type="text" :class="{errorValid:!regTime.test(editFormFee.detail[0].freeTime.time)}"
                    @blur="regexpTime(editFormFee.detail[0].freeTime.time)"
                  v-model="editFormFee.detail[0].freeTime.time">分钟
                  <el-checkbox v-model="editFormFee.detail[0].freeTime.isContain">包含</el-checkbox>
                </td>
                <td>
                  <input :class="{errorValid:!regPrice.test(editFormFee.detail[0].highestFee)}" 
                    @blur="regexpNum(editFormFee.detail[0].highestFee)"
                  v-model="editFormFee.detail[0].highestFee" type="text">元
                  <el-checkbox v-model="editFormFee.detail[0].available">启用</el-checkbox>
                </td>
              </tr>
              <tr>
                <td @click="checkCarType" class="check-detail">大车</td>
                <td>
                  <input type="text" :class="{errorValid:!regTime.test(editFormFee.detail[1].freeTime.time)}" 
                    @blur="regexpTime(editFormFee.detail[1].freeTime.time)"
                  v-model="editFormFee.detail[1].freeTime.time">分钟
                  <el-checkbox v-model="editFormFee.detail[1].freeTime.isContain">包含</el-checkbox>
                </td>
                <td>
                  <input :class="{errorValid:!regPrice.test(editFormFee.detail[1].highestFee)}"
                     @blur="regexpNum(editFormFee.detail[1].highestFee)"
                  v-model="editFormFee.detail[1].highestFee" type="text">元
                  <el-checkbox v-model="editFormFee.detail[1].available">启用</el-checkbox>
                </td>
              </tr>
              <tr>
                <td @click="checkCarType" class="check-detail">超大车</td>
                <td>
                  <input type="text" :class="{errorValid:!regTime.test(editFormFee.detail[2].freeTime.time)}"
                    @blur="regexpTime(editFormFee.detail[2].freeTime.time)"
                  v-model="editFormFee.detail[2].freeTime.time">分钟
                  <el-checkbox v-model="editFormFee.detail[2].freeTime.isContain">包含</el-checkbox>
                </td>
                <td>
                  <input :class="{errorValid:!regPrice.test(editFormFee.detail[2].highestFee)}"
                     @blur="regexpNum(editFormFee.detail[2].highestFee)"
                  v-model="editFormFee.detail[2].highestFee" type="text">元
                  <el-checkbox v-model="editFormFee.detail[2].available">启用</el-checkbox>
                </td>
              </tr>
              <tr>
                <td @click="checkCarType" class="check-detail">摩托车</td>
                <td>
                  <input type="text" :class="{errorValid:!regTime.test(editFormFee.detail[3].freeTime.time)}"
                    @blur="regexpTime(editFormFee.detail[3].freeTime.time)"
                  v-model="editFormFee.detail[3].freeTime.time">分钟
                  <el-checkbox v-model="editFormFee.detail[3].freeTime.isContain">包含</el-checkbox>
                </td>
                <td>
                  <input :class="{errorValid:!regPrice.test(editFormFee.detail[3].highestFee)}"
                     @blur="regexpNum(editFormFee.detail[3].highestFee)"
                   v-model="editFormFee.detail[3].highestFee" type="text">元
                  <el-checkbox v-model="editFormFee.detail[3].available">启用</el-checkbox>
                </td>
              </tr>
            </tbody>
          </table>
          <article v-show="addShowDetail">
            <p class="price-detail">价格明细（<span v-text="carText"></span>）</p>
            <div class="price-cont">
              <table>
                <tr>
                  <td></td>
                  <td class="table-title">时间段</td>
                  <td class="table-title">价格</td>
                </tr>
                <tbody v-for = "(feeDetail , index) in editFormFee.detail" v-show="carTypeIndex == index" :key="feeDetail.id">
                  <tr>
                    <td>高峰期</td>
                    <td>
                      <div v-if="feeDetail.chargeDetailDto.peakPeriodDto">
                        <el-time-picker class="price-input" format="HH:mm" value-format = "HH:mm" 
                        v-model="feeDetail.chargeDetailDto.peakPeriodDto.startTime" placeholder="00:00">
                        </el-time-picker>
                      到
                        <el-time-picker class="price-input" format="HH:mm" value-format = "HH:mm" 
                        v-if="feeDetail.chargeDetailDto.peakPeriodDto" v-model="feeDetail.chargeDetailDto.peakPeriodDto.endTime"  
                        placeholder="00:00">
                        </el-time-picker>
                      </div>
                    </td>
                    <td><div v-if="feeDetail.chargeDetailDto.peakPeriodDto">
                      <input class="price-input" v-model="feeDetail.chargeDetailDto.peakPeriodDto.cash" 
                      :class="{errorValid:!regPrice.test(feeDetail.chargeDetailDto.peakPeriodDto.cash)}" 
                        @blur="regexpNum(feeDetail.chargeDetailDto.peakPeriodDto.cash)"/>元
                      <input class="price-input" v-model="feeDetail.chargeDetailDto.peakPeriodDto.each" 
                      :class="{errorValid:!regTime.test(feeDetail.chargeDetailDto.peakPeriodDto.each)}" 
                        @blur="regexpTime(feeDetail.chargeDetailDto.peakPeriodDto.each)"/>分钟</div></td>
                  </tr>
                  <tr>
                    <td>非高峰期</td>
                    <td>
                      <div v-if="feeDetail.chargeDetailDto.peakPeriodDto">
                        <el-time-picker class="price-input" format="HH:mm" :disabled = "true" value-format = "HH:mm" 
                        v-model="feeDetail.chargeDetailDto.peakPeriodDto.endTime"  placeholder="00:00">
                        </el-time-picker>
                        到
                        <el-time-picker class="price-input" format="HH:mm" :disabled = "true" value-format = "HH:mm" 
                        v-model="feeDetail.chargeDetailDto.peakPeriodDto.startTime"  placeholder="00:00">
                        </el-time-picker>
                      </div>
                    </td>
                    <td><div v-if="feeDetail.chargeDetailDto.nonPeakPeriodDto"><input class="price-input" 
                    :class="{errorValid:!regPrice.test(feeDetail.chargeDetailDto.nonPeakPeriodDto.cash)}"
                      @blur="regexpNum(feeDetail.chargeDetailDto.nonPeakPeriodDto.cash)"
                    v-model="feeDetail.chargeDetailDto.nonPeakPeriodDto.cash" />元
                    <input class="price-input" v-model="feeDetail.chargeDetailDto.nonPeakPeriodDto.each" 
                    :class="{errorValid:!regTime.test(feeDetail.chargeDetailDto.nonPeakPeriodDto.each)}" @blur="regexpTime(feeDetail.chargeDetailDto.nonPeakPeriodDto.each)"/>分钟</div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
        <section v-else-if="feeType == 'time'">
        <el-form :model="editFormTime" ref="editFormTime" :inline-message='true'>
          <h6><span>计费名称:</span><input type="text" v-model = "feeName" :maxlength="50" ></h6> 
          <div class="memo-text" >
            <span>计费描述:</span><textarea :rows="4" :maxlength="256" v-model = "memo"></textarea>
          </div>
          <p>计费详细</p>
          <table>
            <thead>
              <tr><td>车辆类型</td><td>免费时间</td><td>价格</td></tr>
            </thead>
            <tbody>
              <tr><td>小车</td><td><input type="text" prop="detail[0].freeTime.time" 
              :class="{errorValid:!regTime.test(editFormTime.detail[0].freeTime.time)}" 
                @blur="regexpTime(editFormTime.detail[0].freeTime.time)"
              v-model="editFormTime.detail[0].freeTime.time">分钟</td>
              <td><input :class="{errorValid:!regPrice.test(editFormTime.detail[0].timeCharge)}"
                @blur="regexpNum(editFormTime.detail[0].timeCharge)"
              v-model="editFormTime.detail[0].timeCharge" type="text">元次</td></tr>
              <tr><td>大车</td><td><input type="text" :class="{errorValid:!regTime.test(editFormTime.detail[1].freeTime.time)}"
                @blur="regexpTime(editFormTime.detail[1].freeTime.time)"
              v-model="editFormTime.detail[1].freeTime.time">分钟</td>
              <td><input :class="{errorValid:!regPrice.test(editFormTime.detail[1].timeCharge)}"
                @blur="regexpNum(editFormTime.detail[1].timeCharge)"
              v-model="editFormTime.detail[1].timeCharge"  type="text">元次</td></tr>
              <tr><td>超大车</td><td><input type="text" :class="{errorValid:!regTime.test(editFormTime.detail[2].freeTime.time)}"
                @blur="regexpTime(editFormTime.detail[2].freeTime.time)"
              v-model="editFormTime.detail[2].freeTime.time">分钟</td>
              <td><input :class="{errorValid:!regPrice.test(editFormTime.detail[2].timeCharge)}"
                @blur="regexpNum(editFormTime.detail[2].timeCharge)"
              v-model="editFormTime.detail[2].timeCharge" type="text">元次</td></tr>
              <tr><td>摩托车</td><td><input type="text" :class="{errorValid:!regTime.test(editFormTime.detail[3].freeTime.time)}"
                @blur="regexpTime(editFormTime.detail[3].freeTime.time)"
              v-model="editFormTime.detail[3].freeTime.time">分钟</td>
              <td><input :class="{errorValid:!regPrice.test(editFormTime.detail[3].timeCharge)}"
                @blur="regexpNum(editFormTime.detail[3].timeCharge)"
              v-model="editFormTime.detail[3].timeCharge" type="text">元次</td></tr>
            </tbody>
          </table>
        </el-form>
        </section >
        <section v-else-if="feeType == 'ladder'">
          <el-form>
            <h6><span>计费名称:</span><input type="text" :maxlength="50" v-model = "feeName" ></h6> 
            <div class="memo-text" >
              <span>计费描述:</span><textarea :rows="4" :maxlength="256" v-model = "memo" ></textarea>
            </div>
            <p>计费详细</p>
            <el-tabs type="card" v-model="ladderCarType">
              <el-tab-pane :label="carTypeText[index]" :name="carTypeText[index]" 
              v-for="(detailList,index) in editFormladder.detail" :key="detailList.carType">
                <p>{{carTypeText[index]}}收费标准</p>
                <table class="ladder-table">
                  <thead>
                    <tr><td>时间段</td><td>价格</td></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(itemList, i) in editFormladder.detail[index].ladderDetailDtoList" :key="itemList.i">
                      <td>
                        <el-cascader class="select-input" 
                            :options="ladderOpt"
                            :separator="''"
                            change-on-select
                            disabled
                            v-model = "itemList.startTime"
                          ></el-cascader>
                        到
                        <el-cascader class="select-input" 
                          :options="ladderOpt"
                          :separator="''"
                          change-on-select
                          disabled
                          v-if="i == editFormladder.detail[index].ladderDetailDtoList.length - 1"
                          v-model="itemList.endTime"
                        ></el-cascader>
                        <el-cascader class="select-input" 
                          :options="ladderOpt"
                          :separator="''"
                          change-on-select
                          v-else
                          @change = "changeEditTime(index)"
                          v-model="editFormladder.detail[index].ladderDetailDtoList[i+1].startTime"
                        ></el-cascader>
                      <td>
                        <input class="price-input" 
                        :class="{errorValid:!regPrice.test(itemList.ladderCharge)}"
                        @blur="regexpNum(itemList.ladderCharge)"
                        v-model = "itemList.ladderCharge" />元
                        <i class="el-icon-plus" @click="editLadderPlus(index)" 
                        v-show="i == editFormladder.detail[index].ladderDetailDtoList.length-1"></i>
                        <i class="el-icon-minus" @click="editLadderMinus(index)" 
                        v-show="i == editFormladder.detail[index].ladderDetailDtoList.length-1 && i > 0"></i>
                        <span class="ladderPrice" v-show="!regPrice.test(itemList.ladderCharge)">输入金额</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </el-tab-pane>
            </el-tabs>
          </el-form>
        </section>
      </el-main>
    </el-container>
    <el-dialog :visible.sync="dialogAddVisible" title="新增计费" >
        <section id="addFee" class="addFee"> 
          <div class="mt15">
            <el-select v-model="addSelectFee" placeholder="请选择" @change="addSelect">
              <el-option
                v-for="item in feeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>        
          <div class="fee-times" v-if="feeType =='time'">
            <el-form label-width="130px" :model="addFormTime" ref="addFormTime" :rules = "feeTimeRules" :inline-message='true'>
              <div class="form-middle">
                <el-form-item label="计费名称(按次)" prop="name">
                  <el-input v-model="addFormTime.name" style="width:500px" :maxlength="50"></el-input>
                </el-form-item>
                <el-form-item label="计费描述">
                  <el-input type="textarea" v-model="addFormTime.memo" :rows="4" :maxlength="256" style="width:500px"></el-input>
                </el-form-item>
                <table>
                  <thead>
                    <tr><td>车辆类型</td><td>免费时间</td><td>价格</td></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>小车</td><td><input type="text" :class="{errorValid:!regTime.test(addFormTime.detail[0].freeTime.time)}" 
                      @blur="regexpTime(addFormTime.detail[0].freeTime.time)" prop="detail[0].freeTime.time" 
                      v-model="addFormTime.detail[0].freeTime.time">分钟
                      </td>
                      <td><input :class="{errorValid:!regPrice.test(addFormTime.detail[0].timeCharge)}" 
                      @blur="regexpNum(addFormTime.detail[0].timeCharge)" v-model="addFormTime.detail[0].timeCharge" type="text">元次</td></tr>
                    <tr><td>大车</td><td><input type="text" :class="{errorValid:!regTime.test(addFormTime.detail[1].freeTime.time)}" 
                        @blur="regexpNum(addFormTime.detail[1].freeTime.time)" v-model="addFormTime.detail[1].freeTime.time">分钟</td>
                    <td><input :class="{errorValid:!regPrice.test(addFormTime.detail[1].timeCharge)}" 
                    @blur="regexpNum(addFormTime.detail[1].timeCharge)" v-model="addFormTime.detail[1].timeCharge"  type="text">元次</td></tr>
                    <tr><td>超大车</td><td><input type="text" :class="{errorValid:!regTime.test(addFormTime.detail[2].freeTime.time)}" 
                        @blur="regexpNum(addFormTime.detail[2].freeTime.time)" v-model="addFormTime.detail[2].freeTime.time">分钟</td>
                    <td><input :class="{errorValid:!regPrice.test(addFormTime.detail[2].timeCharge)}" 
                    @blur="regexpNum(addFormTime.detail[2].timeCharge)" v-model="addFormTime.detail[2].timeCharge" type="text">元次</td></tr>
                    <tr><td>摩托车</td><td><input type="text" :class="{errorValid:!regTime.test(addFormTime.detail[3].freeTime.time)}"
                      @blur="regexpNum(addFormTime.detail[3].freeTime.time)" v-model="addFormTime.detail[3].freeTime.time">分钟</td>
                    <td><input :class="{errorValid:!regPrice.test(addFormTime.detail[3].timeCharge)}" 
                    @blur="regexpNum(addFormTime.detail[3].timeCharge)" v-model="addFormTime.detail[3].timeCharge" type="text">元次</td></tr>
                  </tbody>
                </table>
              </div>
              <el-form-item style="text-align:right;">
                <el-button @click="dialogAddVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveFee('addFormTime')">保 存</el-button>
              </el-form-item>
            </el-form>  
          </div>	
          <div class="fee-times" v-else-if="feeType =='interval'">
            <el-form label-width="130px" :model="addFormFee" ref="addFormFee" :rules = "feeInterRules" :inline-message='true'>
              <div class="form-middle">
                <el-form-item label="计费名称(按时)" prop="name">
                  <el-input v-model="addFormFee.name" :maxlength="50" style="width:500px" ></el-input>
                </el-form-item>
                <el-form-item label="计费描述">
                  <el-input type="textarea" v-model="addFormFee.memo" :rows="2" :maxlength="256" style="width:500px" ></el-input>
                </el-form-item>
                <table>
                  <thead>
                    <tr><td>车辆类型</td><td>免费时间</td><td>全天最高收费</td></tr>
                  </thead>
                  <tbody>
                    <tr><td @click="checkCarType" class="check-detail">小车</td><td>
                      <input type="text" :class="{errorValid:!regTime.test(addFormFee.detail[0].freeTime.time)}" 
                        @blur="regexpTime(addFormFee.detail[0].freeTime.time)"
                      v-model="addFormFee.detail[0].freeTime.time">分钟
                      <el-checkbox v-model="addFormFee.detail[0].freeTime.isContain">包含</el-checkbox></td>
                      <td><input :class="{errorValid:!regPrice.test(addFormFee.detail[0].highestFee)}"
                        @blur="regexpNum(addFormFee.detail[0].highestFee)"
                          v-model="addFormFee.detail[0].highestFee" type="text">元
                      <el-checkbox v-model="addFormFee.detail[0].available">启用</el-checkbox></td></tr>
                    <tr><td @click="checkCarType" class="check-detail">大车</td><td>
                        <input type="text" :class="{errorValid:!regTime.test(addFormFee.detail[1].freeTime.time)}" 
                        @blur="regexpTime(addFormFee.detail[1].freeTime.time)"  
                        v-model="addFormFee.detail[1].freeTime.time">分钟
                      <el-checkbox v-model="addFormFee.detail[1].freeTime.isContain">包含</el-checkbox></td><td>
                        <input type="text" :class="{errorValid:!regPrice.test(addFormFee.detail[1].highestFee)}" 
                        @blur="regexpNum(addFormFee.detail[1].highestFee)"
                        v-model="addFormFee.detail[1].highestFee">元<el-checkbox v-model="addFormFee.detail[1].available">启用
                          </el-checkbox></td></tr>
                    <tr><td @click="checkCarType" class="check-detail">超大车</td><td>
                        <input type="text" :class="{errorValid:!regTime.test(addFormFee.detail[2].freeTime.time)}" 
                        @blur="regexpTime(addFormFee.detail[2].freeTime.time)"
                        v-model="addFormFee.detail[2].freeTime.time">分钟
                        <el-checkbox v-model="addFormFee.detail[2].freeTime.isContain">包含</el-checkbox></td><td>
                          <input type="text" :class="{errorValid:!regPrice.test(addFormFee.detail[2].highestFee)}" 
                          @blur="regexpNum(addFormFee.detail[2].highestFee)"
                          v-model="addFormFee.detail[2].highestFee">元<el-checkbox v-model="addFormFee.detail[2].available">启用</el-checkbox></td>
                          </tr>
                    <tr><td @click="checkCarType" class="check-detail">摩托车</td><td>
                        <input type="text"  :class="{errorValid:!regTime.test(addFormFee.detail[3].freeTime.time)}" 
                        @blur="regexpTime(addFormFee.detail[3].freeTime.time)"
                        v-model="addFormFee.detail[3].freeTime.time">分钟
                        <el-checkbox v-model="addFormFee.detail[3].freeTime.isContain">包含</el-checkbox></td><td>
                          <input type="text" :class="{errorValid:!regPrice.test(addFormFee.detail[3].highestFee)}"
                          @blur="regexpNum(addFormFee.detail[3].highestFee)"
                          v-model="addFormFee.detail[3].highestFee">元<el-checkbox v-model="addFormFee.detail[3].available">启用
                            </el-checkbox></td></tr>
                  </tbody>
                </table>
                <article v-show="addShowDetail">
                  <p class="price-detail">价格明细（<span v-text="carText"></span>）</p>
                  <div class="price-cont">
                    <table>
                      <tr>
                        <td></td>
                        <td class="table-title">时间段</td>
                        <td class="table-title">价格</td>
                      </tr>
                      <tbody v-for = "(feeDetail , index) in addFormFee.detail" v-show="carTypeIndex == index" :key="feeDetail.id">
                        <tr>
                          <td>高峰期</td>
                          <td>
                            <el-time-picker class="price-input" format="HH:mm" value-format = "HH:mm" 
                            v-model="feeDetail.chargeDetailDto.peakPeriodDto.startTime" placeholder="00:00">
                            </el-time-picker>
                            到
                            <el-time-picker class="price-input" format="HH:mm" value-format = "HH:mm" 
                            v-model="feeDetail.chargeDetailDto.peakPeriodDto.endTime"  placeholder="00:00">
                            </el-time-picker>
                          </td>
                          <td><input class="price-input" :class="{errorValid:!regPrice.test(feeDetail.chargeDetailDto.peakPeriodDto.cash)}"
                            @blur="regexpNum(feeDetail.chargeDetailDto.peakPeriodDto.cash)"
                            v-model="feeDetail.chargeDetailDto.peakPeriodDto.cash" />元
                            <input class="price-input" :class="{errorValid:!regTime.test(feeDetail.chargeDetailDto.peakPeriodDto.each)}"
                            @blur="regexpTime(feeDetail.chargeDetailDto.peakPeriodDto.each)"
                            v-model="feeDetail.chargeDetailDto.peakPeriodDto.each" />分钟</td>
                        </tr>
                        <tr>
                          <td>非高峰期</td>
                          <td>
                            <el-time-picker class="price-input" format="HH:mm" :disabled = "true" value-format = "HH:mm" 
                            v-model="feeDetail.chargeDetailDto.peakPeriodDto.endTime"  placeholder="00:00">
                            </el-time-picker>
                            到
                            <el-time-picker class="price-input" format="HH:mm" :disabled = "true" value-format = "HH:mm" 
                            v-model="feeDetail.chargeDetailDto.peakPeriodDto.startTime"  placeholder="00:00">
                            </el-time-picker>
                          </td>
                          <td><input class="price-input" :class="{errorValid:!regPrice.test(feeDetail.chargeDetailDto.nonPeakPeriodDto.cash)}"
                            @blur="regexpNum(feeDetail.chargeDetailDto.nonPeakPeriodDto.cash)"
                            v-model="feeDetail.chargeDetailDto.nonPeakPeriodDto.cash" />元
                            <input class="price-input" :class="{errorValid:!regTime.test(feeDetail.chargeDetailDto.nonPeakPeriodDto.each)}"
                              @blur="regexpTime(feeDetail.chargeDetailDto.nonPeakPeriodDto.each)"
                              v-model="feeDetail.chargeDetailDto.nonPeakPeriodDto.each" />分钟</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>
              <el-form-item style="text-align:right;">
                <el-button @click="dialogAddVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveFee('addFormFee')">保 存</el-button>
              </el-form-item>
            </el-form>
          </div>	
          <div class="fee-times fee-main" v-else-if="feeType =='ladder'">
            <el-form label-width="130px" :model="addFormLadder" ref="addFormLadder" :rules = "feeLaddRules" :inline-message='true'>
              <div class="form-middle">
                <el-form-item label="计费名称(按阶梯)" prop="name">
                  <el-input v-model="addFormLadder.name" :maxlength="50" style="width:400px" ></el-input>
                </el-form-item>
                <el-form-item label="计费描述">
                  <el-input type="textarea" v-model="addFormLadder.memo" :rows="2" :maxlength="256" style="width:400px" ></el-input>
                </el-form-item>
                <p>计费详细</p>
                <el-tabs type="card" v-model="addLadderCarType" style="margin-left:30px;" @tab-click="ladderTabClick">
                  <el-tab-pane :label="carTypeText[index]" :name="carTypeText[index]" v-for="(itemCar,index) in carTypeText" :key="itemCar.id">
                    <p>{{itemCar}}收费标准</p>
                    <table class="ladder-table">
                      <thead>
                        <tr><td>时间段</td><td>价格</td></tr>
                      </thead>
                      <tbody>
                        <tr v-for="(addList, i) in addFormLadder.detail[index].ladderDetailDtoList" :key="addList.i">
                          <td>
                            <el-cascader class="select-input" 
                              :options="ladderOpt"
                              :separator="''"
                              change-on-select
                              disabled
                              v-model="addList.startTime"
                            ></el-cascader>
                            到
                            <el-cascader class="select-input" 
                              :options="ladderOpt"
                              :separator="''"
                              change-on-select
                              :disabled = "i == addFormLadder.detail[index].ladderDetailDtoList.length-1"
                              v-if="i == addFormLadder.detail[index].ladderDetailDtoList.length-1"
                              v-model="addList.endTime"
                            ></el-cascader>
                            <el-cascader class="select-input" 
                              :options="ladderOpt"
                              :separator="''"
                              change-on-select
                              :class="{errorValid:addFormLadder.detail[index].ladderDetailDtoList[i].ladderValid === false}"
                              :disabled = "i == addFormLadder.detail[index].ladderDetailDtoList.length-1"
                              @change = "changeLadderTime"
                              v-else
                            ></el-cascader>
                            <span v-show="!addFormLadder.detail[index].ladderDetailDtoList[i].ladderValid && i !== addFormLadder.detail[index].ladderDetailDtoList.length-1" class="ladderError">
                              不为空且大于开始时间
                            </span>
                          <td>
                            <input class="price-input" :class="{errorValid:!regPrice.test(addList.ladderCharge)}" @blur="regexpNum(addList.ladderCharge)" v-model="addList.ladderCharge"/>元
                            <i class="el-icon-plus" @click="addLadder" v-show="i == addFormLadder.detail[index].ladderDetailDtoList.length-1"></i>
                            <i class="el-icon-minus" @click="minusLadder" 
                            v-show="i == addFormLadder.detail[index].ladderDetailDtoList.length-1 && i !== 0"></i>
                            <span class="ladderPrice" v-show="!regPrice.test(addList.ladderCharge)">输入金额</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <el-form-item style="text-align:right;">
                <el-button @click="dialogAddVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveFee('addFormLadder')">保 存</el-button>
              </el-form-item>
            </el-form>
          </div>
        </section>
    </el-dialog>
  </div>
</template>
<script>
import { queryFee, addFee, deleteFee, updateCharge, feeIsExist } from '@/views/ParkingLotApp/apis'
export default {
  data () {
    var isExist = (rule, value, callback) => {
      value = encodeURI(value)
      feeIsExist(value).then(function (response) {
        let errorcode = response.code
        if (errorcode === '0') {
          if (response.data.isExist) {
            callback(new Error('该计费名称已存在!'))
          } else {
            callback()
          }
        }
      })
    }
    return {
      feeData: [],
      regPrice: /^((?!0[0-9])\d+(\.\d{1,2})?)$/,
      regTime: /^(0|[1-9][0-9]*)$/,
      dialogAddVisible: false,
      ladderValid: true,
      addLadderValid: true,
      editLadderValid: true,
      num: 0,
      feeId: '',
      feeType: '',
      feeName: '',
      addSelectFee: '',
      memo: '',
      feeValid: true,
      showDetail: false,
      addShowDetail: true,
      isChecked: true,
      noChecked: false,
      isNoData: true,
      ladderCarType: '小车',
      addLadderCarType: '小车',
      carTypeIndex: 0,
      carTypeText: ['小车', '大车', '摩托车', '超大车'],
      detail: {
        carType: ''
      },
      carText: '小车',
      feeInterRules: {
        name: [
          { required: true, message: '请输入计费名称', trigger: 'blur' },
          { max: 50, message: '最大长度为50字符', trigger: 'blur' },
          { validator: isExist, trigger: 'blur' }
        ]
      },
      feeTimeRules: {
        name: [
          { required: true, message: '请输入计费名称', trigger: 'blur' },
          { max: 50, message: '最大长度为50字符', trigger: 'blur' },
          { validator: isExist, trigger: 'blur' }
        ]
      },
      feeLaddRules: {
        name: [
          { required: true, message: '请输入计费名称', trigger: 'blur' },
          { max: 50, message: '最大长度为50字符', trigger: 'blur' },
          { validator: isExist, trigger: 'blur' }
        ]
      },
      editFormTime: {
        name: '',
        ruleName: '',
        ruleType: '',
        detail: [{
          carType: '0',
          freeTime: {
            time: ''
          },
          timeCharge: ''
        }, {
          carType: '1',
          freeTime: {
            time: ''
          },
          timeCharge: ''
        }, {
          carType: '2',
          freeTime: {
            time: ''
          },
          timeCharge: ''
        }, {
          carType: '3',
          freeTime: {
            time: ''
          },
          timeCharge: ''
        }]
      },
      editFormFee: {
        id: '',
        name: '',
        ruleName: '',
        ruleType: '',
        detail: [{
          carType: '0',
          available: false,
          freeTime: {
            time: '',
            isContain: false
          },
          highestFee: '',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '',
              each: ''
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '',
              each: ''
            }
          }
        }, {
          carType: '1',
          available: false,
          freeTime: {
            time: '',
            isContain: false
          },
          highestFee: '',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '',
              each: ''
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '',
              each: ''
            }
          }
        }, {
          carType: '2',
          available: false,
          freeTime: {
            time: '',
            isContain: false
          },
          highestFee: '',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '',
              each: ''
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '',
              each: ''
            }
          }
        }, {
          carType: '3',
          available: false,
          freeTime: {
            time: '',
            isContain: false
          },
          highestFee: '',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '',
              each: ''
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '',
              each: ''
            }
          }
        }]
      },
      editFormladder: {
        detail: [{
          carType: 0,
          ladderDetailDtoList: []
        },
        {
          carType: 1,
          ladderDetailDtoList: []
        },
        {
          carType: 2,
          ladderDetailDtoList: []
        },
        {
          carType: 3,
          ladderDetailDtoList: []
        }]
      },
      addFormFee: {
        name: '',
        ruleType: 'interval',
        memo: '',
        detail: [{
          carType: '0',
          available: false,
          freeTime: {
            time: '0',
            isContain: false
          },
          highestFee: '0.00',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            }
          }
        }, {
          carType: '1',
          available: false,
          freeTime: {
            time: '0',
            isContain: false
          },
          highestFee: '0.00',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            }
          }
        }, {
          carType: '2',
          available: false,
          freeTime: {
            time: '0',
            isContain: false
          },
          highestFee: '0.00',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            }
          }
        }, {
          carType: '3',
          available: false,
          freeTime: {
            time: '0',
            isContain: false
          },
          highestFee: '0.00',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            }
          }
        }]
      },
      addFormTime: {// 新增按次数据模板
        name: '',
        ruleType: 'time',
        memo: '',
        detail: [{
          carType: '0',
          freeTime: {
            time: '0'
          },
          timeCharge: '0.00'
        }, {
          carType: '1',
          freeTime: {
            time: '0'
          },
          timeCharge: '0.00'
        }, {
          carType: '2',
          freeTime: {
            time: '0'
          },
          timeCharge: '0.00'
        }, {
          carType: '3',
          freeTime: {
            time: '0'
          },
          timeCharge: '0.00'
        }]
      },
      addFormLadder: {
        name: '',
        addTime: true,
        ruleName: '',
        ruleType: 'ladder',
        memo: '',
        detail: [{
          carType: 0,
          ladderDetailDtoList: [{
            'endTime': [24],
            'ladderCharge': '0.00',
            'startTime': [0],
            'ladderValid': false
          }]
        }, {
          carType: 1,
          ladderDetailDtoList: [{
            'endTime': [24],
            'ladderCharge': '0.00',
            'startTime': [0]
          }]
        }, {
          carType: 2,
          ladderDetailDtoList: [{
            'endTime': [24],
            'ladderCharge': '0.00',
            'startTime': [0]
          }]
        }, {
          carType: 3,
          ladderDetailDtoList: [{
            'endTime': [24],
            'ladderCharge': '0.00',
            'startTime': [0]
          }]
        }]
      },
      addLaderIndex: 0,
      ladderOpt: [],
      ladderTimeEnd: [1, 45],
      timeFormat: [],
      feeOptions: [{
        value: 'time',
        label: '按次收费'
      }, {
        value: 'interval',
        label: '按时收费'
      }, {
        value: 'ladder',
        label: '按阶梯收费'
      }]
    }
  },
  mounted () {
    this.loadFeeList()
    this.setLadderTime()
  },
  methods: {
    loadFeeList () { // 加载列表
      let _this = this
      // _this.loading = true
      queryFee()
        .then(function (response) {
          if (response.data.length > 0) {
            _this.isNoData = false
            _this.feeData = (response.data)
            _this.feeType = response.data[0].ruleType
            _this.feeId = response.data[0].uuid
            _this.feeName = response.data[0].ruleName
            _this.memo = response.data[0].memo
            // console.log('type ' + _this.feeType)
            if (_this.feeType === 'time') {
              _this.editFormTime.detail = JSON.parse(response.data[0].detail)
            } else if (_this.feeType === 'interval') {
              _this.editFormFee.detail = JSON.parse(response.data[0].detail)
              console.log(_this.editFormFee.detail)
              _this.stringToObj(_this.editFormFee.detail)
            } else if (_this.feeType === 'ladder') {
              // console.log('data : ' + response.data[0].detail)
              _this.editFormladder.detail = JSON.parse(response.data[0].detail)
              for (let i = 0; i < _this.editFormladder.detail.length; i++) {
                for (let j = 0; j < _this.editFormladder.detail[i].ladderDetailDtoList.length; j++) {
                  let endT = _this.editFormladder.detail[i].ladderDetailDtoList[j].endTime
                  let startT = _this.editFormladder.detail[i].ladderDetailDtoList[j].startTime
                  _this.editFormladder.detail[i].ladderDetailDtoList[j].endTime = _this.valTimeFormat(endT)
                  _this.editFormladder.detail[i].ladderDetailDtoList[j].startTime = _this.valTimeFormat(startT)
                }
              }
            } else {
              _this.isNoData = true
            }
          }
        })
        .catch(function (error) {
          this.loading = false
          this.isNoData = true
          // _this.$message.error('数据异常')
          console.log(error)
        }.bind(this)
      )
    },
    // 切换计费
    tabTitle (index, item) {
      this.feeId = item.uuid
      this.showDetail = false
      this.num = index
      this.feeType = item.ruleType
      this.feeName = item.ruleName
      this.memo = item.memo
      this.feeValid = true
      if (this.feeType === 'time') {
        if (typeof item.detail === 'string') {
          this.editFormTime.detail = JSON.parse(item.detail)
        } else {
          this.editFormTime.detail = item.detail
        }
      } else if (this.feeType === 'interval') {
        this.editFormFee.detail = JSON.parse(item.detail)
        this.stringToObj(this.editFormFee.detail)
      } else if (this.feeType === 'ladder') {
        // console.log(typeof item.detail)
        this.editFormladder.detail = JSON.parse(item.detail)
        // this.valTimeFormat(this.editFormladder.detail)
        for (let i = 0; i < this.editFormladder.detail.length; i++) {
          for (let j = 0; j < this.editFormladder.detail[i].ladderDetailDtoList.length; j++) {
            let endT = this.editFormladder.detail[i].ladderDetailDtoList[j].endTime
            let startT = this.editFormladder.detail[i].ladderDetailDtoList[j].startTime
            this.editFormladder.detail[i].ladderDetailDtoList[j].endTime = this.valTimeFormat(endT)
            this.editFormladder.detail[i].ladderDetailDtoList[j].startTime = this.valTimeFormat(startT)
          }
        }
      }
    },
    // 车辆格式化转变
    carTypeFormat: function (row, column) {
      if (row.carType === 0) {
        return '小车'
      } else if (row.carType === 1) {
        return '大车'
      } else if (row.carType === 2) {
        return '超大车'
      } else if (row.carType === 3) {
        return '摩托车'
      }
    },
    // 点击新增
    addFee () {
      this.addSelectFee = this.feeType
      if (this.feeType === 'ladder') {
        this.addFormLadder.detail = [{
          carType: 0,
          ladderDetailDtoList: [{
            'endTime': [24],
            'ladderCharge': '0.00',
            'startTime': [0, 0]
          }]
        }, {
          carType: 1,
          ladderDetailDtoList: [{
            'endTime': [24],
            'ladderCharge': '0.00',
            'startTime': [0, 0]
          }]
        }, {
          carType: 2,
          ladderDetailDtoList: [{
            'endTime': [24],
            'ladderCharge': '0.00',
            'startTime': [0, 0]
          }]
        }, {
          carType: 3,
          ladderDetailDtoList: [{
            'endTime': [24],
            'ladderCharge': '0.00',
            'startTime': [0, 0]
          }]
        }]
        this.addFormLadder.memo = ' '
      } else if (this.feeType === 'time') {
        this.addFormTime.memo = ' '
        this.addFormTime.detail = [{
          carType: '0',
          freeTime: {
            time: '0'
          },
          timeCharge: '0.00'
        }, {
          carType: '1',
          freeTime: {
            time: '0'
          },
          timeCharge: '0.00'
        }, {
          carType: '2',
          freeTime: {
            time: '0'
          },
          timeCharge: '0.00'
        }, {
          carType: '3',
          freeTime: {
            time: '0'
          },
          timeCharge: '0.00'
        }]
      } else if (this.feeType === 'interval') {
        this.addFormFee.memo = ' '
        this.addFormFee.detail = [{
          carType: '0',
          available: false,
          freeTime: {
            time: '0',
            isContain: false
          },
          highestFee: '0.00',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            }
          }
        }, {
          carType: '1',
          available: false,
          freeTime: {
            time: '0',
            isContain: false
          },
          highestFee: '0.00',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            }
          }
        }, {
          carType: '2',
          available: false,
          freeTime: {
            time: '0',
            isContain: false
          },
          highestFee: '0.00',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            }
          }
        }, {
          carType: '3',
          available: false,
          freeTime: {
            time: '0',
            isContain: false
          },
          highestFee: '0.00',
          chargeDetailDto: {
            peakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            },
            nonPeakPeriodDto: {
              startTime: '',
              endTime: '',
              cash: '0.00',
              each: '0'
            }
          }
        }]
      }
      this.dialogAddVisible = true
    },
    updataFeeData () {
      let _this = this
      queryFee().then(function (response) {
        if (response.data.length > 0) {
          _this.feeData = (response.data)
        }
      })
    },
    // 新增保存
    saveFee (feeForm) {
      if (!this.feeValid) {
        this.$message({
          message: '时间或者价格只能输入数字!',
          type: 'warning'
        })
      } else {
        let _this = this
        let _params
        if (_this.feeType === 'interval') {
          _params = _this.addFormFee
          for (let i = 0; i < _params.detail.length; i++) {
            _params.detail[i].chargeDetailDto.nonPeakPeriodDto.startTime = _params.detail[i].chargeDetailDto.peakPeriodDto.endTime
            _params.detail[i].chargeDetailDto.nonPeakPeriodDto.endTime = _params.detail[i].chargeDetailDto.peakPeriodDto.startTime
          }
          console.log('feeForm : ' + feeForm)
          console.log(_this.$refs)
          _this.$refs.addFormFee.validate((valid) => {
            if (valid) {
              _this.resSaveFee(_params, feeForm)
            }
          })
        } else if (_this.feeType === 'time') {
          _params = _this.addFormTime
          _this.$refs.addFormTime.validate((valid) => {
            if (valid) {
              _this.resSaveFee(_params, feeForm)
            }
          })
        } else if (_this.feeType === 'ladder') {
          _params = _this.addFormLadder
          if (_this.addFormLadder.name === '') {
            _this.$message.error('请输入阶梯名称')
          } else {
            _this.resSaveFee(_params, feeForm)
          }
          // _this.$refs.addFormLadder.validate((valid) => {
          //   if (valid && _this.addLadderValid) {
          //     _this.resSaveFee(_params, feeForm)
          //   }
          // })
        }
        console.log('_params' + JSON.stringify(_params))
        console.log(this.$refs)
      }
      // this.$refs.feeForm.validate((valid) => {
      //   if (valid) {
      //   }
      // })
    },
    resSaveFee (params, feeForm) {
      let _this = this
      addFee({
        params: JSON.stringify(params)
      }).then(function (response) {
        _this.num = 0
        var errorcode = response.code
        _this.$refs[feeForm].resetFields()
        if (errorcode === '0') {
          _this.$message({message: '新增成功！', type: 'success'})
          _this.loadFeeList()
        } else {
          _this.$error({message: '新增失败', type: 'error'})
        }
        _this.dialogAddVisible = false
      })
      .catch(function (error) {
        _this.$refs[feeForm].resetFields()
        _this.$message.error({message: error || '新增失败'})
      })
    },
    // 修改保存
    editSaveFee () {
      if (!this.feeValid) {
        this.$message({
          message: '时间或者价格只能输入数字!',
          type: 'warning'
        })
      } else {
        let _this = this
        let _params
        if (_this.feeType === 'time') {
          _params = _this.editFormTime
        } else if (_this.feeType === 'interval') {
          _params = _this.editFormFee
        } else if (_this.feeType === 'ladder') {
          _params = _this.editFormladder
        }
        _params.name = _this.feeName
        _params.ruleType = _this.feeType
        _params.id = _this.feeId
        _params.memo = _this.memo
        // console.log(_params.detail.freeTime)
        if (_params.name === '') {
          _this.$message({message: '计费规则名称不能为空!', type: 'warning'})
          return false
        }
        console.log('_params' + JSON.stringify(_params))
        updateCharge({
          params: JSON.stringify(_params)
        }).then(function (response) {
          var errorcode = response.code
          if (errorcode === '0') {
            _this.$message({message: '修改成功！', type: 'success'})
            _this.num = 0
            _this.updataFeeData()
          } else {
            _this.$error({message: '修改失败', type: 'error'})
          }
        })
        .catch(function (error) {
          _this.$message.error({message: '修改失败' || error})
        })
      }
    },
    //  删除计费信息
    deleteFee () {
      var _this = this
      var feeId = _this.feeId
      _this
        .$confirm('是否要删除此计费信息', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          deleteFee(feeId)
            .then(function (response) {
              var errorcode = response.code
              if (errorcode === '0') {
                _this.$alert('删除成功', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {
                    _this.loadFeeList()
                    _this.num = 0
                  }
                })
              } else if (errorcode === 'parkinglot.fee.rule.plate.number.repeate') {
                _this.$alert('计费信息已授权使用，删除失败!', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {}
                })
              } else {
                _this.$alert('删除失败', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {}
                })
              }
            })
            .catch(() => {})
        })
        .catch(() => {})
    },
    // 新增时切换车辆类型
    checkCarType (event) {
      this.carText = event.currentTarget.textContent
      this.addShowDetail = true
      if (this.carText === '小车') {
        this.carTypeIndex = 0
      } else if (this.carText === '大车') {
        this.carTypeIndex = 1
      } else if (this.carText === '超大车') {
        this.carTypeIndex = 2
      } else if (this.carText === '摩托车') {
        this.carTypeIndex = 3
      }
      this.addFormFee.detail[this.carTypeIndex].carType = this.carTypeIndex
    },
    addLadder () {
      let len = this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList.length - 1
      if (this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList[len].startTime.length > 0) {
        this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList.push({
          'endTime': [24],
          'ladderCharge': '',
          'startTime': [],
          'ladderValid': false
        })
      } else {
        this.$message({
          message: '请先选择开始时间',
          type: 'warning'
        })
      }
      this.addLadderValid = false
    },
    changeLadderTime (val) {
      console.log(event)
      let len = this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList.length - 1
      this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList[len].startTime = val
      this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList[len - 1].ladderValid = true
      let sTime = this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList[len - 1].startTime
      this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList[len - 1].endTime = val
      //  console.log('endTime' + endTime)
      let endTime = val
      let sHour = sTime[0]
      let sMinit = sTime[1]
      let eHour = endTime[0]
      let eMinit = endTime[1]
      if (eHour > sHour) {
        this.ladderValid = true
      } else if (eHour === sHour) {
        if (eMinit && eMinit > sMinit) {
          this.addLadderValid = true
          this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList[len - 1].ladderValid = true
        } else {
          this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList[len - 1].ladderValid = false
          this.addLadderValid = false
          this.$message({message: '结束时间必须大于开始时间', type: 'warning'})
        }
      } else {
        this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList[len - 1].ladderValid = false
        this.addLadderValid = false
        this.$message({message: '结束时间必须大于开始时间', type: 'warning'})
      }
    },
    minusLadder () {
      this.addFormLadder.detail[this.addLaderIndex].ladderDetailDtoList.pop()
    },
    setLadderTime () {
      let child = [{
        value: 15,
        label: '15分钟'
      }, {
        value: 30,
        label: '30分钟'
      }, {
        value: 45,
        label: '45分钟'
      }]
      for (let i = 0; i <= 24; i++) {
        if (i === 24) {
          this.ladderOpt.push({
            'value': i,
            'label': i + '小时',
            disabled: true
          })
        } else {
          this.ladderOpt.push({
            'value': i,
            'label': i + '小时',
            'children': child
          })
        }
      }
    },
    ladderTabClick (tab, event) {
      this.addLaderIndex = tab.index
    },
    addSelect (val) {
      this.feeType = val
    },
    changeEditTime (index) {
      let len = this.editFormladder.detail[index].ladderDetailDtoList.length - 1
      let sTime = this.editFormladder.detail[index].ladderDetailDtoList[len - 1].startTime
      let endTime = this.editFormladder.detail[index].ladderDetailDtoList[len].startTime
      this.editFormladder.detail[index].ladderDetailDtoList[len - 1].endTime = endTime
      console.log('endTime' + endTime)
      let sHour = sTime[0]
      let sMinit = sTime[1]
      let eHour = endTime[0]
      let eMinit = endTime[1]
      if (eHour > sHour) {
        this.ladderValid = true
      } else if (eHour === sHour) {
        if (eMinit && eMinit > sMinit) {
          this.ladderValid = true
        } else {
          this.ladderValid = false
          this.$message({message: '结束时间必须大于开始时间', type: 'warning'})
        }
      } else {
        this.ladderValid = false
        this.$message({message: '结束时间必须大于开始时间', type: 'warning'})
      }
    },
    editLadderPlus (index) {
      let len = this.editFormladder.detail[index].ladderDetailDtoList.length - 1
      console.log(this.editFormladder.detail[index].ladderDetailDtoList[len].startTime)
      if (this.editFormladder.detail[index].ladderDetailDtoList[len].startTime.length !== 0) {
        this.editFormladder.detail[index].ladderDetailDtoList.push({
          'endTime': [24],
          'ladderCharge': '0.00',
          'startTime': []
        })
      } else {
        this.$message({
          message: '请先选择上一个时间段',
          type: 'warning'
        })
      }
      this.editLadderValid = false
    },
    editLadderMinus (index) {
      let len = this.editFormladder.detail[index].ladderDetailDtoList.length - 2
      this.editFormladder.detail[index].ladderDetailDtoList[len].endTime = [24]
      this.editFormladder.detail[index].ladderDetailDtoList.pop()
    },
    stringToObj (stringObj) {
      for (let i = 0; i < stringObj.length; i++) {
        if (typeof stringObj[i].freeTime.isContain === 'string') {
          stringObj[i].freeTime.isContain = JSON.parse(stringObj[i].freeTime.isContain)
          stringObj[i].available = JSON.parse(stringObj[i].available)
        }
      }
    },
    regexpNum (val) {
      let reg = /^((?!0[0-9])\d+(\.\d{1,2})?)$/
      if (!reg.test(val)) {
        this.$message.error('只能输入整数或者小数后两位')
        this.feeValid = false
      } else {
        this.feeValid = true
      }
    },
    regexpTime (val) {
      console.log(event)
      let reg = /^(0|[1-9][0-9]*)$/
      if (!reg.test(val)) {
        this.$message.error('时间只能输入整数')
        this.feeValid = false
      } else {
        this.feeValid = true
      }
    },
    valTimeFormat (val) {
      let arrString = val.replace(/[\u4E00-\u9FA5]/g, ',').split(',,')
      let arrNubs = []
      for (let i = 0; i < arrString.length; i++) {
        if (arrString[i] !== '') {
          arrNubs.push(Number(arrString[i]))
        }
      }
      return arrNubs
    },
    timeFormatLadder (time) {
      return time.replace(/[\u4E00-\u9FA5]/g, ',').split(',,')
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/views/ParkingLotApp/assets/css/parkLotApp.less";
</style>

