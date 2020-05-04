<template>
    <div>
                <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-alert
            title="添加商品信息"
            type="inf0" :closable="false" show-icon center>
        </el-alert>
        <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" label-position="top">
            <el-tabs tab-position="left"  v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClick">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格(元)" prop="goods_price">
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader
                        v-model="addForm.goods_cat"
                        :options="cateList"
                        :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children' }"
                        @change="cateChange"
                        clearable>
                        </el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <el-form-item  v-for="item in paramsList " :key="item.attr_id" :label="item.attr_name">
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attr_name" v-for="item in paramsOnlyList" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <el-upload
                    action="http://127.0.0.1:8888/api/private/v1/upload"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    :headers="headerObj"
                    list-type="picture"
                    :on-success="handSuccess">
                        <el-button size="small" type="primary">上传图片</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                    <el-dialog
                    title="图片预览"
                    :visible.sync="picDialogVisible"
                    width="50%"
                    >
                    <img :src="picPath" class="picClass">
                    </el-dialog>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                      <quill-editor
                        v-model="addForm.goods_introduce"
                        >
                      </quill-editor>
                      <el-button type="primary" style="margin-top:15px" @click="submitGoods"> 添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormrules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      cateList: [],
      paramsList: [],
      paramsOnlyList: [],
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      picPath: '',
      picDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
    },
    cateChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    tabClick () {
      if (this.activeIndex === '1') {
        this.paramsList = this.getParamsList()
      } else if (this.activeIndex === '2') {
        this.paramsOnlyList = this.getParamsOnlyList()
      }
    },
    async getParamsList () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取动态参数列表失败')
      }
      res.data.forEach(element => {
        element.attr_vals = element.attr_vals.length === 0 ? [] : element.attr_vals.split(' ')
      })
      this.paramsList = res.data
    },
    async getParamsOnlyList () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取静态属性列表失败')
      }
      this.paramsOnlyList = res.data
    },
    // 图片预览
    handlePreview (file) {
      this.picPath = file.response.data.url
      this.picDialogVisible = true
    },
    // 删除图片
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => {
        x.pic = filePath
      })
      this.addForm.pics.splice(i, 1)
    },
    // 上传成功
    handSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    submitGoods () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表达项')
        }
        const formData = _.cloneDeep(this.addForm)
        formData.goods_cat = formData.goods_cat.join(',')
        this.paramsList.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        this.paramsOnlyList.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        formData.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', formData)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps{
    margin: 15px 0;
}
.el-step_title{
    font-size: 13px;
}
.el-checkbox{
    margin-right: 5px;
}
.picClass{
    width: 100%;
}
</style>
