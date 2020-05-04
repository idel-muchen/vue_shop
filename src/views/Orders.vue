<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.pay_status===0">已付款</el-tag>
              <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间"  width="160px">
            <template slot-scope="scope">
                {{scope.row.create_time|dateFormat}}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope" >
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editlocationdialogVisible=true"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressDialog(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog
    title="修改地址"
    :visible.sync="editlocationdialogVisible"
    width="50%"
    @close="closeDialog">
    <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" >
        <el-form-item label="省市区/县" prop="address1">
            <el-cascader
            class="casclass"
                    v-model="addressForm.address1"
                    :options="city"
                    :props="{ expandTrigger: 'hover'}"
                    clearable>
            </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="editlocationdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editlocationdialogVisible = false">确 定</el-button>
    </span>
    </el-dialog>

    <el-dialog
    title="物流信息"
    :visible.sync="progressDialogVisible"
    width="50%">
    <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import city from './citydata.js'
export default {

  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      ordersList: [],
      total: 0,
      editlocationdialogVisible: false,
      addressForm: {
        address1: [],
        address2: '' },
      addressFormRules: {
        address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
      },

      city,
      progressDialogVisible: false,
      progressInfo: []

    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    closeDialog () {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressDialog (data) {
      this.progressDialogVisible = true
      const { data: res } = await this.$http.get(`/kuaidi/804909574412544580`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败！')
      }
      this.progressInfo = res.data
    }

  }
}
</script>
<style lang="less" scoped>
.casclass{
    width: 100%;
}
</style>
